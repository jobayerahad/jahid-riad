import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'

/**
 * Defense-in-depth gate for admin routes.
 * Cookie presence is checked here; each page and server action still verifies the session.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) return NextResponse.next()

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*']
}
