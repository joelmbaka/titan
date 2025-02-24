import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get('host');
  
  // Check if the request is for a subdomain
  const subdomain = host?.split('.')[0];
  
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    // Rewrite the URL to the dynamic store route
    url.pathname = `/store/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
} 