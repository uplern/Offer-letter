import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from '@/lib/admin-session'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  try {
    const { data: admin, error } = await supabaseAdmin.from('admins').select('*').eq('email', email).single()
    if (error || !admin) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, admin.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = createAdminSessionToken(admin.id)
    res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
    return res.status(200).json({ success: true, admin: { id: admin.id, email: admin.email, name: admin.name || 'Admin' } })
  } catch {
    return res.status(500).json({ error: 'Login failed' })
  }
}
