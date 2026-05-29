import crypto from 'crypto'

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!secret) throw new Error('Missing session secret')
  return secret
}

function sign(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex')
}

export function createAdminSessionToken(adminId: string): string {
  const payload = JSON.stringify({ adminId, exp: Date.now() + SESSION_TTL_MS })
  const encoded = Buffer.from(payload).toString('base64url')
  const signature = sign(encoded)
  return `${encoded}.${signature}`
}

export function verifyAdminSessionToken(token?: string | null): { valid: boolean; adminId?: string } {
  if (!token) return { valid: false }
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return { valid: false }
  if (sign(encoded) !== signature) return { valid: false }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
    if (!parsed?.adminId || !parsed?.exp || parsed.exp < Date.now()) return { valid: false }
    return { valid: true, adminId: parsed.adminId }
  } catch {
    return { valid: false }
  }
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE
