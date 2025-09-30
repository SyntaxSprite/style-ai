import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a placeholder middleware. The actual auth logic is handled client-side in AuthProvider.
// For server-side protection, a more robust solution like NextAuth.js or JWTs in cookies would be needed.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login
     * - signup
     * - / (public homepage)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup|$).*)',
  ],
}
