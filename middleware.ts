import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const isPublicPath = [
    '/sign-in',
    '/api/auth',
    '/',
    '/error',
  ].some(path => pathname.startsWith(path));

  // Define protected paths that require authentication
  const isProtectedPath = pathname.startsWith('/dashboard');

  // Handle authentication redirects
  if (isProtectedPath && !session) {
    // Redirect to sign-in if trying to access protected route without auth
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicPath && session) {
    // Redirect to dashboard if trying to access public route while authenticated
    if (pathname === '/sign-in') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /api/auth/ (NextAuth.js internals)
     * 3. /static (public files)
     * 4. .*\\..*$ (files with extensions)
     */
    '/((?!_next|api/auth|static|.*\\..*$).*)',
  ],
}; 