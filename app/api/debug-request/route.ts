import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the hostname and other request details
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  const isSubdomainRequest = 
    hostname.includes('.joelmbaka.site') && 
    subdomain !== 'www' && 
    subdomain !== 'joelmbaka';
  
  // Get all headers for debugging
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  // Get all cookies for debugging
  const cookies: Record<string, string> = {};
  request.cookies.getAll().forEach(cookie => {
    cookies[cookie.name] = cookie.value;
  });
  
  // Get URL details
  const url = new URL(request.url);
  
  return NextResponse.json({
    success: true,
    message: 'Debug request endpoint',
    request: {
      hostname,
      subdomain,
      isSubdomainRequest,
      url: request.url,
      pathname: request.nextUrl.pathname,
      headers,
      cookies
    },
    url: {
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash
    },
    middleware: {
      rewrite: headers['x-middleware-rewrite'] || null,
      subdomain: headers['x-middleware-subdomain'] || null
    },
    timestamp: new Date().toISOString()
  });
} 