import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the hostname from the request
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  const isSubdomainRequest = 
    hostname.includes('.joelmbaka.site') && 
    subdomain !== 'www' && 
    subdomain !== 'joelmbaka';
  
  return NextResponse.json({
    success: true,
    message: 'Subdomain test endpoint is working',
    hostname,
    subdomain,
    isSubdomainRequest,
    url: request.url,
    pathname: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  });
} 