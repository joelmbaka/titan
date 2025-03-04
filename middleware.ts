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
  const session = await auth();

  // Allow access to the sign-in page without authentication
  if (request.nextUrl.pathname.startsWith('/sign-in')) {
    return NextResponse.next();
  }

  // If the session is valid, allow access to the requested route
  if (session) {
    return NextResponse.next();
  }

  // Redirect to sign-in if trying to access protected route without auth
  return NextResponse.redirect(new URL('/sign-in', request.url));
}

// Update matcher to exclude static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}; 