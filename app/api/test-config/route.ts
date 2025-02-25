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
  
  return NextResponse.json({
    success: true,
    message: 'Configuration test endpoint is working',
    request: {
      hostname,
      subdomain,
      isSubdomainRequest,
      url: request.url,
      pathname: request.nextUrl.pathname,
      headers
    },
    vercel: {
      region: process.env.VERCEL_REGION || 'unknown',
      env: process.env.VERCEL_ENV || 'unknown'
    },
    timestamp: new Date().toISOString()
  });
} 