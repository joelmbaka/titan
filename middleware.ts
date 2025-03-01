import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

// Function to check if a store exists in the database
async function checkStoreExists(subdomain: string): Promise<boolean> {
  try {
    // Make a request to your API endpoint that checks store existence
    const response = await fetch(`https://joelmbaka.site/api/check-subdomain-store?subdomain=${subdomain}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to check store existence: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log("Store existence check result:", data);
    
    // Return true if the store exists
    return data.exists === true;
  } catch (error) {
    console.error("Error checking store existence:", error);
    // In case of error, we'll assume the store doesn't exist
    return false;
  }
}

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
      
      // Check if the store exists in the database
      console.log("Checking if store exists:", subdomain);
      const storeExists = await checkStoreExists(subdomain);
      
      if (!storeExists) {
        console.log("Store does not exist:", subdomain);
        
        // Extract domain parts to get the main domain
        const domainParts = hostname.split('.');
        // Remove the subdomain
        domainParts.shift();
        // Get the main domain
        const mainDomain = domainParts.join('.');
        
        // Redirect to a "store not found" page on the main domain
        const notFoundUrl = new URL('/store-not-found', `https://${mainDomain}`);
        
        // Add the subdomain as a query parameter for context
        notFoundUrl.searchParams.append('subdomain', subdomain);
        
        console.log("Redirecting to store not found page:", notFoundUrl.toString());
        
        return NextResponse.redirect(notFoundUrl, 307);
      }
      
      // Create the target path on the main domain
      const targetPath = pathname === '/' 
        ? `/store/${subdomain}` 
        : `/store/${subdomain}${pathname}`;
      
      console.log("Handling subdomain request for:", subdomain);
      
      try {
        // Extract domain parts to get the main domain
        const domainParts = hostname.split('.');
        // Remove the subdomain
        domainParts.shift();
        // Get the main domain
        const mainDomain = domainParts.join('.');
        
        // Create a redirect URL to the main domain with the store path
        const redirectUrl = new URL(targetPath, `https://${mainDomain}`);
        
        console.log("Redirecting to main domain:", redirectUrl.toString());
        
        // Create a temporary redirect (307) to preserve the request method
        const response = NextResponse.redirect(redirectUrl, 307);
        
        // Add debug headers
        response.headers.set('x-middleware-redirect', redirectUrl.toString());
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
        console.error("Error in middleware redirect:", error);
        
        // Fallback approach - try a simpler redirect construction
        try {
          // Hardcode the main domain as a fallback
          const fallbackRedirectUrl = `https://joelmbaka.site${targetPath}`;
          console.log("Fallback redirect URL:", fallbackRedirectUrl);
          
          const response = NextResponse.redirect(fallbackRedirectUrl, 307);
          response.headers.set('x-middleware-redirect', fallbackRedirectUrl);
          response.headers.set('x-middleware-subdomain', subdomain);
          
          return response;
        } catch (fallbackError) {
          console.error("Fallback redirect also failed:", fallbackError);
          
          // Last resort - just continue without redirecting
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
        '/store-not-found', // Allow access to the store not found page
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