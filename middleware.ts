import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  try {
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
      isSubdomainRequest,
      url: request.url
    });

    // Handle subdomain requests - IMPORTANT: Do this before auth checks
    if (isSubdomainRequest) {
      // Skip API routes for subdomain requests - let Vercel handle them
      if (pathname.startsWith('/api/')) {
        console.log("Skipping middleware for API route on subdomain:", pathname);
        return NextResponse.next();
      }
      
      // Skip Next.js internal routes
      if (pathname.startsWith('/_next/') || 
          pathname.includes('/favicon.ico') ||
          pathname.includes('.png') ||
          pathname.includes('.jpg') ||
          pathname.includes('.svg')) {
        console.log("Skipping middleware for static asset:", pathname);
        return NextResponse.next();
      }
      
      // Determine the base URL for the main application (not the subdomain)
      // This is crucial - we need to rewrite to the main app URL, not the subdomain URL
      const mainAppUrl = new URL(request.url);
      
      // Extract the domain parts
      const domainParts = hostname.split('.');
      // Remove the subdomain part
      domainParts.shift();
      // Reconstruct the main domain
      const mainDomain = domainParts.join('.');
      
      // Set the host to the main domain
      mainAppUrl.host = mainDomain;
      
      // Create the target path
      const targetPath = pathname === '/' 
        ? `/store/${subdomain}` 
        : `/store/${subdomain}${pathname}`;
      
      // Create a new URL with the main app origin and the target path
      const rewriteUrl = new URL(targetPath, mainAppUrl.origin);
      
      console.log("Rewriting subdomain request to:", targetPath);
      console.log("Full rewrite URL:", {
        href: rewriteUrl.href,
        origin: rewriteUrl.origin,
        protocol: rewriteUrl.protocol,
        host: rewriteUrl.host,
        pathname: rewriteUrl.pathname
      });
      
      try {
        // Add debug header to track the rewrite
        const response = NextResponse.rewrite(rewriteUrl);
        response.headers.set('x-middleware-rewrite', rewriteUrl.pathname);
        response.headers.set('x-middleware-subdomain', subdomain);
        
        // Add a cookie to track the subdomain
        response.cookies.set('subdomain', subdomain, {
          path: '/',
          maxAge: 3600,
          sameSite: 'strict',
          secure: true
        });
        
        return response;
      } catch (error) {
        console.error("Error in middleware URL rewrite:", error);
        // Fallback using a different approach
        try {
          // Use a hardcoded domain as a last resort
          const fallbackUrl = new URL(targetPath, `https://joelmbaka.site`);
          console.log("Fallback URL:", fallbackUrl.toString());
          
          const response = NextResponse.rewrite(fallbackUrl);
          response.headers.set('x-middleware-rewrite', fallbackUrl.pathname);
          response.headers.set('x-middleware-subdomain', subdomain);
          
          return response;
        } catch (fallbackError) {
          console.error("Fallback URL rewrite also failed:", fallbackError);
          // Last resort - just continue without rewriting
          return NextResponse.next();
        }
      }
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
        '/api/check-subdomain-store', // Allow checking store existence
        '/api/create-test-store', // Allow creating test stores
        '/api/debug-request', // Allow debug endpoint
        '/api/subdomain-test', // Allow subdomain test endpoint
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
  } catch (error) {
    console.error("Unhandled error in middleware:", error);
    // Return next response to prevent the middleware from crashing
    return NextResponse.next();
  }
}

// Update matcher to exclude static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}; 