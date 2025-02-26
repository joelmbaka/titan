import { NextRequest, NextResponse } from 'next/server';
import { getStoreBySubdomain } from '@/lib/storeFunctions.server';

export async function GET(request: NextRequest) {
  try {
    // Get the hostname from the request
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
    
    // Try to fetch the store if this is a subdomain request
    let store = null;
    if (isSubdomainRequest) {
      store = await getStoreBySubdomain(subdomain);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subdomain test API is working',
      request: {
        hostname,
        subdomain,
        isSubdomainRequest,
        url: request.url,
        pathname: request.nextUrl.pathname,
        headers,
        cookies
      },
      store: store ? {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        industry: store.industry
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in subdomain test API:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 