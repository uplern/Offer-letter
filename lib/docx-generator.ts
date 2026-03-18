import { saveAs } from 'file-saver'
import { getTemplateCode } from './role-tenure-mapping'

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const errorData: any = await response.json()
      const mainError = errorData?.error || errorData?.message
      const details = errorData?.details ? ` (${errorData.details})` : ''
      return mainError ? `${mainError}${details}` : JSON.stringify(errorData)
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

export interface OfferLetterData {
  candidateName: string
  roleCode: string
  tenureMonths: number
  roleName: string
  tenureLabel: string
  generatedDate?: string
  userId: string
}

// Generate offer letter by calling API endpoint
export async function generateOfferLetter(data: OfferLetterData): Promise<void> {
  try {
    const templateCode = getTemplateCode(data.roleCode, data.tenureMonths)

    const currentDate = data.generatedDate || new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    // Call API endpoint to generate offer letter (HTML based)
    const response = await fetchWithTimeout('/api/generate-offer-html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidateName: data.candidateName,
        date: currentDate,
        roleName: data.roleName,
        tenureLabel: data.tenureLabel,
        templateCode: templateCode,
        userId: data.userId
      })
    }, 60_000)

    if (!response.ok) {
      const message = await readErrorMessage(response)
      throw new Error(message || 'Failed to generate offer letter')
    }

    // Get the blob from response
    const blob = await response.blob()

    // Verify blob is not empty
    if (blob.size === 0) {
      throw new Error('Generated PDF is empty')
    }

    console.log(`PDF blob received. Size: ${blob.size} bytes, Type: ${blob.type}`)

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Offer_Letter_${data.candidateName.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(a)
    a.click()

    // Cleanup
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

  } catch (error: any) {
    console.error('Error generating offer letter:', error)
    throw new Error(error.message || 'Failed to generate offer letter')
  }
}

// Template validation
export function validateTemplate(templateCode: string): boolean {
  const validTemplates = ['SM_2M', 'SM_4M', 'TA_1M', 'TA_2M', 'TA_4M', 'TASM_2M', 'TASM_4M']
  return validTemplates.includes(templateCode)
}
