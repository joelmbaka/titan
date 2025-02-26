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
    status: 'ok',
    message: 'Health check endpoint is working',
    timestamp: new Date().toISOString(),
    hostname,
    subdomain,
    isSubdomainRequest
  });
} 