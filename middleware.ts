import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const ADMIN_SESSION_COOKIE = 'admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAdmin = pathname.startsWith('/admin')
  if (!isAdmin) return NextResponse.next()

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const hasSession = Boolean(token)

  if (pathname.startsWith('/admin/login')) {
    if (hasSession) return NextResponse.redirect(new URL('/admin', req.url))
    return NextResponse.next()
  }

  if (!hasSession) return NextResponse.redirect(new URL('/admin/login', req.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
