import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const ADMIN_SESSION_COOKIE = 'admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAdmin = pathname.startsWith('/admin')
  if (!isAdmin) return NextResponse.next()

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const hasSession = Boolean(token)

  console.log(`[Middleware] Path: ${pathname}, Has Cookie: ${hasSession}, Token: ${token ? token.substring(0, 15) + '...' : 'none'}`)

  if (pathname.startsWith('/admin/login')) {
    if (hasSession) {
      console.log(`[Middleware] Redirecting logged in admin to /admin`)
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  if (!hasSession) {
    console.log(`[Middleware] Redirecting unauthenticated request from ${pathname} to /admin/login`)
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
