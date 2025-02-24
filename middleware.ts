import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get('host');
  
  console.log('Middleware - Request URL:', url.toString());
  console.log('Middleware - Host:', host);

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