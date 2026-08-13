import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'
import sharp from 'sharp'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
}

// Optimized compression settings for maximum free tier capacity
const COMPRESSION_CONFIG = {
    maxWidth: 1600, // Reduced from 1920 for better compression
    maxHeight: 1600,
    quality: 70, // Reduced from 80 to save more space
    format: 'webp' as const, // WebP gives best compression (30-50% smaller than JPEG)
}
const ALLOWED_FOLDERS = new Set(['aadhar_front', 'aadhar_back', 'photos', 'college_ids', 'marksheets'])
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'image/heic', 'image/heif'])
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024

async function compressImage(buffer: Buffer, contentType: string): Promise<{ buffer: Buffer; contentType: string }> {
    // Only compress images
    if (!contentType.startsWith('image/')) {
        return { buffer, contentType }
    }

    try {
        const image = sharp(buffer)
        const metadata = await image.metadata()

        console.log('Original image:', {
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            size: buffer.length
        })

        // Resize if too large
        let resized = image
        if (metadata.width && metadata.width > COMPRESSION_CONFIG.maxWidth) {
            resized = resized.resize(COMPRESSION_CONFIG.maxWidth, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
        }

        // Convert to WebP with compression
        const compressed = await resized
            .webp({ quality: COMPRESSION_CONFIG.quality })
            .toBuffer()

        const compressionRatio = ((1 - compressed.length / buffer.length) * 100).toFixed(1)
        console.log('Compressed image:', {
            originalSize: buffer.length,
            compressedSize: compressed.length,
            saved: compressionRatio + '%'
        })

        return {
            buffer: compressed,
            contentType: 'image/webp'
        }
    } catch (error) {
        console.error('Compression failed, using original:', error)
        return { buffer, contentType }
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { fileData, fileName, contentType, folder, userId, phone } = req.body

        if (!fileData || !fileName || !contentType || !folder || !userId) {
            return res.status(400).json({
                error: 'Missing required fields'
            })
        }
        if (!ALLOWED_FOLDERS.has(folder)) {
            return res.status(400).json({ error: 'Invalid upload folder' })
        }
        if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
            return res.status(400).json({ error: 'Invalid file type' })
        }

        // Basic authorization check: Ensure a custom header matches the userId
        // In a real app, this would be a verified JWT session check.
        const authHeader = req.headers['x-user-id']
        if (authHeader !== userId) {
            return res.status(401).json({ error: 'Unauthorized: User mapping mismatch' })
        }

        // Convert base64 to buffer
        const base64Data = fileData.split(',')[1] || fileData
        let buffer = Buffer.from(base64Data, 'base64')
        if (buffer.length === 0 || buffer.length > MAX_FILE_SIZE_BYTES) {
            return res.status(400).json({ error: 'Invalid file size' })
        }
        let finalContentType = contentType

        console.log('Upload request:', {
            fileName,
            originalSize: buffer.length,
            contentType
        })

        // Compress image if it's an image file
        if (contentType.startsWith('image/')) {
            const compressed = await compressImage(buffer, contentType)
            buffer = Buffer.from(compressed.buffer)
            finalContentType = compressed.contentType
        }

        // Use a human-readable, stable filename based on phone number so retries overwrite the same file
        // Format: folder/doctype_phone.webp  e.g. photos/photo_9876543210.webp
        const ext = finalContentType === 'image/webp' ? 'webp' : (fileName.split('.').pop() || 'bin')
        const cleanPhone = phone ? String(phone).replace(/\D/g, '').slice(0, 15) : ''
        const identifier = cleanPhone || userId
        const uniqueFileName = `${folder}/${folder}_${identifier}.${ext}`

        console.log('Uploading to Supabase:', {
            path: uniqueFileName,
            size: buffer.length,
            contentType: finalContentType
        })

        // Upload to Supabase with upsert:true — overwrites existing file if user retries
        const { data, error } = await supabaseAdmin.storage
            .from('applications')
            .upload(uniqueFileName, buffer, {
                contentType: finalContentType,
                cacheControl: '3600',
                upsert: true
            })

        if (error) {
            console.error('Upload error:', error)
            return res.status(500).json({ error: error.message })
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('applications')
            .getPublicUrl(uniqueFileName)

        return res.status(200).json({
            url: urlData.publicUrl,
            path: uniqueFileName
        })

    } catch (error: any) {
        console.error('Server upload failed:', error)
        return res.status(500).json({ error: error.message })
    }
}
