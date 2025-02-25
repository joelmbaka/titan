import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  // Only log authentication info, don't try to sync with Neo4j here
  const session = await auth();
  
  // Log authentication information for debugging
  console.log("Middleware auth check:", {
    path: request.nextUrl.pathname,
    hasSession: !!session,
    userId: session?.user?.id || 'none'
  });

  // Define public paths that don't require authentication
  const isPublicPath = [
    '/sign-in',
    '/api/auth',
    '/',
    '/error',
    '/api/graphql', // Allow GraphQL API to handle its own auth
  ].some(path => request.nextUrl.pathname.startsWith(path));

  // Define protected paths that require authentication
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard');

  // Handle authentication redirects
  if (isProtectedPath && !session) {
    // Redirect to sign-in if trying to access protected route without auth
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicPath && session && request.nextUrl.pathname === '/sign-in') {
    // Redirect to dashboard if trying to access sign-in while authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

// Only run middleware on specific routes, NOT on API routes that use Neo4j
export const config = {
  matcher: [
    '/((?!api/graphql|api/neo4j|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 