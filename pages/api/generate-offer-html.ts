import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import path from 'path'
import fs from 'fs'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { PDFDocument } from 'pdf-lib'

// Disable body parser and increase response size limit
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
        responseLimit: false,
    },
}

/**
 * Merges a background PDF (bg) with a content PDF (fg).
 * Each page of fg is overlaid on top of the corresponding page of bg.
 * If bg has fewer pages than fg, the last bg page is repeated.
 */
async function mergeWithBackground(bgPdfBytes: Uint8Array, fgPdfBytes: Uint8Array): Promise<Uint8Array> {
    const bgDoc = await PDFDocument.load(bgPdfBytes)
    const fgDoc = await PDFDocument.load(fgPdfBytes)

    const outputDoc = await PDFDocument.create()
    const fgPageCount = fgDoc.getPageCount()
    const bgPageCount = bgDoc.getPageCount()

    for (let i = 0; i < fgPageCount; i++) {
        // Use last bg page if fg has more pages than bg
        const bgPageIndex = Math.min(i, bgPageCount - 1)

        // Embed the bg page into outputDoc
        const [embeddedBgPage] = await outputDoc.embedPdf(bgDoc, [bgPageIndex])

        // Create a new output page with the bg page dimensions
        const bgPage = bgDoc.getPage(bgPageIndex)
        const { width, height } = bgPage.getSize()
        const newPage = outputDoc.addPage([width, height])

        // Draw background first
        newPage.drawPage(embeddedBgPage, {
            x: 0,
            y: 0,
            width,
            height,
        })

        // Embed the fg (content) page on top
        const [embeddedFgPage] = await outputDoc.embedPdf(fgDoc, [i])
        newPage.drawPage(embeddedFgPage, {
            x: 0,
            y: 0,
            width,
            height,
        })
    }

    return outputDoc.save()
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { candidateName, date, roleName, tenureLabel, templateCode, userId } = req.body

        // 1. Security Check: Verify User ID exists and matches
        if (!userId) {
            return res.status(400).json({ error: 'Missing user reference' })
        }

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return res.status(404).json({ error: 'Application record not found' })
        }

        const dbName = `${user.first_name} ${user.last_name}`.trim()
        const finalCandidateName = dbName

        // Default to RSBPE_65D if no template code provided (fallback)
        const templateName = templateCode || 'RSBPE_65D'
        const templatePath = path.join(process.cwd(), 'public', 'templates', 'html', `${templateName}.html`)

        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: `Template not found: ${templateName}` })
        }

        let htmlContent = fs.readFileSync(templatePath, 'utf8')

        const publicDir = path.join(process.cwd(), 'public')

        // Helper to read image as base64
        const getImageBase64 = (relativePath: string, mimeType = 'image/png') => {
            try {
                const fullPath = path.join(publicDir, relativePath)
                if (fs.existsSync(fullPath)) {
                    const file = fs.readFileSync(fullPath)
                    return `data:${mimeType};base64,${file.toString('base64')}`
                }
            } catch (e) {
                console.warn(`Image not found: ${relativePath}`)
            }
            return ''
        }

        const sealBase64 = getImageBase64('templates/temp/seal&sign.png')

        const currentDate = date || new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })

        // Replace placeholders — no logo, no background image (bg comes from PDF merge)
        htmlContent = htmlContent
            .replace(/{{Name}}/g, finalCandidateName)
            .replace(/{{Date}}/g, currentDate)
            .replace(/{{LOGO_IMAGE}}/g, '')        // logo removed
            .replace(/{{BACKGROUND_IMAGE}}/g, '')  // no CSS bg; real bg injected via PDF merge
            .replace(/{{SEAL_IMAGE}}/g, sealBase64)

        // Launch Puppeteer
        console.log('Launching Puppeteer...')

        const isLocal = process.env.NODE_ENV === 'development'

        let browser: any
        if (isLocal) {
            const possiblePaths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                process.env.CHROME_PATH
            ].filter(Boolean) as string[]

            let executablePath: string | undefined
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    executablePath = p
                    break
                }
            }

            if (!executablePath) {
                console.warn('Could not automatically find Chrome. PDF generation may fail.')
            }

            console.log(`Launching browser with executablePath: ${executablePath || 'default'}`)
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: (chromium as any).defaultViewport,
                executablePath,
                headless: true,
            } as any)
        } else {
            const prodPath = await chromium.executablePath()
            console.log(`Launching prod browser with path: ${prodPath}`)
            browser = await puppeteer.launch({
                args: (chromium as any).args,
                defaultViewport: (chromium as any).defaultViewport,
                executablePath: prodPath,
                headless: (chromium as any).headless,
            } as any)
        }

        let finalPdfBytes: Uint8Array

        try {
            const page = await browser.newPage()
            page.setDefaultTimeout(30_000)

            await page.setRequestInterception(true)
            page.on('request', (request: any) => {
                const url = request.url()
                const resourceType = request.resourceType?.() || ''

                if (
                    url.startsWith('http') &&
                    (resourceType === 'stylesheet' || resourceType === 'font') &&
                    (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com'))
                ) {
                    request.abort()
                    return
                }

                request.continue()
            })

            console.log('Setting HTML content...')
            await page.setContent(htmlContent, {
                waitUntil: 'domcontentloaded',
                timeout: 30_000,
            })

            console.log('Generating content PDF...')
            const contentPdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0'
                }
            })

            console.log(`Content PDF generated. Size: ${contentPdfBuffer.length} bytes`)

            // --- Merge with bg_ofl.pdf background ---
            const bgPdfPath = path.join(publicDir, 'templates', 'temp', 'bg_ofl.pdf')

            if (fs.existsSync(bgPdfPath)) {
                console.log('Merging with background PDF (bg_ofl.pdf)...')
                const bgPdfBytes = fs.readFileSync(bgPdfPath)
                finalPdfBytes = await mergeWithBackground(
                    new Uint8Array(bgPdfBytes),
                    new Uint8Array(contentPdfBuffer)
                )
                console.log(`Merged PDF size: ${finalPdfBytes.length} bytes`)
            } else {
                console.warn('bg_ofl.pdf not found — returning plain content PDF')
                finalPdfBytes = new Uint8Array(contentPdfBuffer)
            }

        } finally {
            if (browser) {
                await browser.close()
            }
        }

        // Send final PDF
        const filename = `Offer_Letter_${finalCandidateName.replace(/\s+/g, '_')}.pdf`
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.setHeader('Content-Length', finalPdfBytes.length)
        res.end(Buffer.from(finalPdfBytes))
        console.log('Final merged PDF sent to client')

    } catch (error: any) {
        console.error('CRITICAL Error generating PDF:', error)
        res.status(500).json({
            error: 'Failed to generate PDF',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
}
