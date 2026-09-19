import { saveAs } from 'file-saver'
import { getTemplateCode } from './role-tenure-mapping'

const MAX_GENERATION_RETRIES = 3

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

export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) {
    const now = new Date()
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
  }

  if (typeof dateInput === 'string') {
    const isoMatch = dateInput.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/)
    if (isoMatch) {
      const [, y, m, d] = isoMatch
      return `${d}/${m}/${y}`
    }
  }

  const d = new Date(dateInput)
  if (!isNaN(d.getTime())) {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  const now = new Date()
  return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
}

// Generate offer letter by calling API endpoint
export async function generateOfferLetter(data: OfferLetterData): Promise<void> {
  try {
    const templateCode = getTemplateCode(data.roleCode, data.tenureMonths)
    if (!templateCode) {
      throw new Error('No offer template configured for selected role and tenure')
    }

    const currentDate = data.generatedDate || formatDate(new Date())

    let response: Response | null = null
    let lastError = ''
    for (let attempt = 1; attempt <= MAX_GENERATION_RETRIES; attempt++) {
      try {
        response = await fetchWithTimeout('/api/generate-offer-html', {
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

        if (response.ok) break
        lastError = await readErrorMessage(response)
      } catch (error: any) {
        lastError = error?.message || 'Network error while generating offer letter'
      }

      if (attempt < MAX_GENERATION_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500))
      }
    }

    if (!response || !response.ok) {
      throw new Error(lastError || 'Failed to generate offer letter')
    }

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
  const validTemplates = ['RSBPE_65D']
  return validTemplates.includes(templateCode)
}
