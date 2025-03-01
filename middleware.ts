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
        
        // Simple redirect to store not found page
        const redirectUrl = `https://joelmbaka.site/store-not-found?subdomain=${subdomain}`;
        console.log("Redirecting to store not found page:", redirectUrl);
        
        return NextResponse.redirect(redirectUrl, 307);
      }
      
      // IMPORTANT CHANGE: Instead of trying to rewrite the URL, we'll just pass through
      // the request and let the Vercel rewrites in vercel.json handle it
      console.log("Handling subdomain request for:", subdomain);
      console.log("Letting Vercel rewrites handle the request");
      
      // Add a cookie to track the subdomain
      const response = NextResponse.next();
      response.cookies.set('subdomain', subdomain, {
        path: '/',
        maxAge: 3600,
        sameSite: 'strict',
        secure: true
      });
      
      // Add debug headers
      response.headers.set('x-middleware-subdomain', subdomain);
      
      return response;
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
        const signInUrl = `https://joelmbaka.site/sign-in`;
        return NextResponse.redirect(signInUrl, 307);
      }

      if (isPublicPath && session && request.nextUrl.pathname === '/sign-in') {
        // Redirect to dashboard if trying to access sign-in while authenticated
        const dashboardUrl = `https://joelmbaka.site/dashboard`;
        return NextResponse.redirect(dashboardUrl, 307);
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