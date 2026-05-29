import imageCompression from 'browser-image-compression'

async function readErrorMessage(response: Response): Promise<string> {
    try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
            const errorData: any = await response.json()
            return errorData?.error || errorData?.message || JSON.stringify(errorData)
        }

        const text = await response.text()
        return text || `Request failed with status ${response.status}`
    } catch {
        return `Request failed with status ${response.status}`
    }
}

async function fetchWithTimeout(
    input: RequestInfo | URL,
    init: RequestInit,
    timeoutMs: number
): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        })
    } finally {
        window.clearTimeout(timeoutId)
    }
}

// Server-side file upload helper with client-side compression
export class ServerFileUpload {
    private static readonly MAX_UPLOAD_RETRIES = 3
    // Aggressive compression settings for maximum free tier capacity
    private static COMPRESSION_OPTIONS = {
        maxSizeMB: 0.2, // Target 200KB max per image (Aggressive for free tier)
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.6, // Slightly reduced quality for better compression
    }

    static async uploadFile(
        file: File,
        folder: string,
        userId: string
    ): Promise<{ url: string; path: string; error?: string }> {
        try {
            let fileToUpload = file

            // Compress image on client-side BEFORE uploading
            if (file.type.startsWith('image/')) {
                console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')

                try {
                    const compressedFile = await imageCompression(file, this.COMPRESSION_OPTIONS)
                    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
                    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '% saved')

                    fileToUpload = compressedFile
                } catch (compressionError) {
                    console.warn('Client-side compression failed, using original:', compressionError)
                    // Continue with original file if compression fails
                }
            }

            // Convert file to base64
            const base64 = await this.fileToBase64(fileToUpload)

            let response: Response | null = null
            let lastError = ''
            for (let attempt = 1; attempt <= this.MAX_UPLOAD_RETRIES; attempt++) {
                try {
                    response = await fetchWithTimeout('/api/upload-file', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': userId
                        },
                        body: JSON.stringify({
                            fileData: base64,
                            fileName: fileToUpload.name,
                            contentType: fileToUpload.type,
                            folder,
                            userId
                        })
                    }, 60_000)

                    if (response.ok) break
                    lastError = await readErrorMessage(response)
                } catch (error: any) {
                    lastError = error?.message || 'Network error during upload'
                }

                if (attempt < this.MAX_UPLOAD_RETRIES) {
                    await new Promise((resolve) => setTimeout(resolve, attempt * 1200))
                }
            }

            if (!response || !response.ok) {
                throw new Error(lastError || 'Upload failed')
            }

            const result = await response.json()
            return {
                url: result.url,
                path: result.path
            }

        } catch (error: any) {
            console.error('Upload failed:', error)
            return {
                url: '',
                path: '',
                error: error.message
            }
        }
    }

    private static fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    static validateFile(file: File): { valid: boolean; error?: string } {
        // Reduced from 10MB to 5MB to encourage compression
        const MAX_SIZE = 5 * 1024 * 1024 // 5MB
        const ALLOWED_TYPES = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/heic',
            'image/heif',
            'image/webp', // Added WebP support
            'application/pdf'
        ]

        if (file.size > MAX_SIZE) {
            return { valid: false, error: 'File size must be less than 5MB (images will be auto-compressed)' }
        }

        if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|heic|heif|webp|pdf)$/i)) {
            return { valid: false, error: 'Invalid file type. Allowed: JPG, PNG, HEIC, WebP, PDF' }
        }

        return { valid: true }
    }
}
