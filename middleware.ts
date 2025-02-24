import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - Static files (_next/static, _next/image, favicons)
     * - API routes
     * - Auth routes
     * - Public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|public).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get('host');
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Skip middleware for excluded paths first
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/api/neo4j') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/public') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!token && !url.pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL(`/api/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}`, request.url));
  }

  // Check if the request is for a subdomain
  const subdomain = host?.split('.')[0];

  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    // Rewrite the URL to the dynamic store route
    url.pathname = `/store/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
} 