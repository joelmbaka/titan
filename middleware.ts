import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - Static files (_next/static, _next/image, favicons)
     * - API routes
     * - Auth routes
     * - Public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|api|auth|public).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get('host');

  console.log('Middleware - Request URL:', url.toString());
  console.log('Middleware - Host:', host);

  // Skip middleware for excluded paths first
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/public') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|ico)$/)
  ) {
    console.log('Middleware - Skipping static file, API route, or favicon:', url.pathname);
    return NextResponse.next();
  }

  const session = await auth();

  // Redirect unauthenticated users to the sign-in page
  if (!session && !url.pathname.startsWith('/auth')) {
    console.log('Middleware - Redirecting to sign-in page');
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Check if the request is for a subdomain
  const subdomain = host?.split('.')[0];

  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    console.log('Middleware - Detected subdomain:', subdomain);
    // Rewrite the URL to the dynamic store route
    url.pathname = `/store/${subdomain}${url.pathname}`;
    console.log('Middleware - Rewriting to:', url.toString());
    return NextResponse.rewrite(url);
  }

  console.log('Middleware - No subdomain detected, continuing');
  return NextResponse.next();
} 