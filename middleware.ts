import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  // On protège uniquement les routes /admin
  if (url.pathname.startsWith('/admin')) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      // 🔐 CHANGE LE MOT DE PASSE ICI (admin / vegapunk2025)
      if (user === 'admin' && pwd === 'vegapunk2025') {
        return NextResponse.next()
      }
    }
    url.pathname = '/api/auth'
    return new NextResponse('Auth Required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}