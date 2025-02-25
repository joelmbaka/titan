import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  // Get the hostname from the request
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Check if this is a subdomain request
  const subdomain = hostname.split('.')[0];
  const isSubdomainRequest = 
    hostname.includes('.joelmbaka.site') && 
    subdomain !== 'www' && 
    subdomain !== 'joelmbaka';
  
  // Log request information for debugging
  console.log("Middleware request:", {
    hostname,
    pathname,
    subdomain,
    isSubdomainRequest
  });

  // Handle subdomain requests - IMPORTANT: Do this before auth checks
  if (isSubdomainRequest) {
    // Skip API routes for subdomain requests - let Vercel handle them
    if (pathname.startsWith('/api/')) {
      console.log("Skipping middleware for API route on subdomain:", pathname);
      return NextResponse.next();
    }
    
    // Rewrite the URL to the store route for non-API paths
    const url = request.nextUrl.clone();
    url.pathname = `/store/${subdomain}${pathname === '/' ? '' : pathname}`;
    
    console.log("Rewriting subdomain request to:", url.pathname);
    return NextResponse.rewrite(url);
  }

  // Only check authentication for non-subdomain requests
  if (!isSubdomainRequest) {
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
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

// Update matcher to exclude API routes on subdomains
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 