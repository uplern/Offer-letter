import type { NextApiRequest, NextApiResponse } from 'next'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-session'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`)
  res.status(200).json({ success: true })
}
