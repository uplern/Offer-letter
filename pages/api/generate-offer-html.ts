import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import path from 'path'
import fs from 'fs'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Disable body parser and increase response size limit
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
        responseLimit: false,
    },
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

        // const supabaseAdmin = createAdminClient()
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return res.status(404).json({ error: 'Application record not found' })
        }

        // Optional: Verify name matches to prevent spoofing (fuzzy match or exact)
        // For now, we trust the DB record and use IT for the name if desired, 
        // or just verify the provided name matches the DB name.
        const dbName = `${user.first_name} ${user.last_name}`.trim()
        // We can enforce using the DB name to ensure the offer letter matches the application
        const finalCandidateName = dbName

        // Default to SM_2M if no template code provided (fallback)
        const templateName = templateCode || 'SM_2M'
        const templatePath = path.join(process.cwd(), 'public', 'templates', 'html', `${templateName}.html`)

        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: `Template not found: ${templateName}` })
        }

        let htmlContent = fs.readFileSync(templatePath, 'utf8')

        // Get absolute paths for images
        const publicDir = path.join(process.cwd(), 'public')

        // Helper to read image as base64
        const getImageBase64 = (relativePath: string) => {
            try {
                const fullPath = path.join(publicDir, relativePath)
                if (fs.existsSync(fullPath)) {
                    const file = fs.readFileSync(fullPath)
                    return `data:image/png;base64,${file.toString('base64')}`
                }
            } catch (e) {
                console.warn(`Image not found: ${relativePath}`)
            }
            return ''
        }

        const logoBase64 = getImageBase64('templates/temp/logo.png')
        const bgBase64 = getImageBase64('templates/temp/background.png')
        const sealBase64 = getImageBase64('templates/temp/seal&sign.png')

        const currentDate = date || new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })

        // Replace placeholders
        htmlContent = htmlContent
            .replace(/{{Name}}/g, finalCandidateName)
            .replace(/{{Date}}/g, currentDate)
            .replace(/{{LOGO_IMAGE}}/g, logoBase64)
            .replace(/{{BACKGROUND_IMAGE}}/g, bgBase64)
            .replace(/{{SEAL_IMAGE}}/g, sealBase64)

        // Launch Puppeteer
        console.log('Launching Puppeteer...')

        // Configure for serverless (Vercel) vs Local
        const isLocal = process.env.NODE_ENV === 'development'

        let browser: any
        if (isLocal) {
            // Robust local Chrome path detection for Windows
            const possiblePaths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                process.env.CHROME_PATH // Allow override via env var
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
                args: isLocal ? ['--no-sandbox', '--disable-setuid-sandbox'] : (chromium as any).args,
                defaultViewport: (chromium as any).defaultViewport,
                executablePath,
                headless: true,
            } as any)
        } else {
            // Production (Vercel)
            const prodPath = await chromium.executablePath()
            console.log(`Launching prod browser with path: ${prodPath}`)
            browser = await puppeteer.launch({
                args: (chromium as any).args,
                defaultViewport: (chromium as any).defaultViewport,
                executablePath: prodPath,
                headless: (chromium as any).headless,
            } as any)
        }

        try {
            const page = await browser.newPage()
            page.setDefaultTimeout(30_000)

            await page.setRequestInterception(true)
            page.on('request', (request: any) => {
                const url = request.url()
                const resourceType = request.resourceType?.() || ''

                // Templates include Google Fonts (@import). External requests can be slow or hang.
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

            console.log('Generating PDF...')
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0'
                }
            })

            console.log(`PDF generated successfully. Size: ${pdfBuffer.length} bytes`)

            // Send PDF
            const filename = `Offer_Letter_${finalCandidateName.replace(/\s+/g, '_')}.pdf`
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
            res.setHeader('Content-Length', pdfBuffer.length)
            res.end(pdfBuffer)
            console.log('PDF sent to client')
        } finally {
            if (browser) {
                await browser.close()
            }
        }

    } catch (error: any) {
        console.error('CRITICAL Error generating PDF:', error)
        res.status(500).json({ 
            error: 'Failed to generate PDF', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        })
    }
}
