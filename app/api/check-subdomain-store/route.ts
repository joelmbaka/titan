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
    
    // If not a subdomain request, get the subdomain from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const querySubdomain = searchParams.get('subdomain');
    
    // Use the subdomain from the hostname or the query parameter
    const targetSubdomain = isSubdomainRequest ? subdomain : querySubdomain;
    
    if (!targetSubdomain) {
      return NextResponse.json({
        success: false,
        message: 'No subdomain provided',
        isSubdomainRequest,
        hostname,
        request: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries())
        }
      }, { status: 400 });
    }
    
    console.log(`Checking store for subdomain: ${targetSubdomain}`);
    
    // Check if the store exists
    const store = await getStoreBySubdomain(targetSubdomain);
    
    // Get middleware info
    const middlewareInfo = {
      rewritePath: isSubdomainRequest ? `/store/${subdomain}${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}` : null,
      vercelRewriteDestination: isSubdomainRequest ? `/store/${subdomain}/${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname.substring(1)}` : null
    };
    
    return NextResponse.json({
      success: true,
      exists: !!store,
      subdomain: targetSubdomain,
      store: store ? {
        id: store.id,
        name: store.name,
        industry: store.industry,
        subdomain: store.subdomain
      } : null,
      request: {
        isSubdomainRequest,
        hostname,
        url: request.url,
        pathname: request.nextUrl.pathname,
        headers: Object.fromEntries(request.headers.entries())
      },
      middleware: middlewareInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking store:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check store',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 