import { NextRequest, NextResponse } from 'next/server';
import { getStoreBySubdomain } from '@/lib/storeFunctions.server';

export async function GET(request: NextRequest) {
  try {
    // Get the subdomain from the query parameter
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain');
    
    if (!subdomain) {
      return NextResponse.json({ 
        error: 'Subdomain parameter is required' 
      }, { status: 400 });
    }
    
    console.log(`API - Checking store for subdomain: ${subdomain}`);
    
    // Try to fetch the store
    const store = await getStoreBySubdomain(subdomain);
    
    if (!store) {
      return NextResponse.json({ 
        exists: false,
        message: `No store found for subdomain: ${subdomain}` 
      });
    }
    
    // Return store info without sensitive data
    return NextResponse.json({
      exists: true,
      store: {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        industry: store.industry
      }
    });
  } catch (error) {
    console.error('Error checking store:', error);
    return NextResponse.json({ 
      error: 'Failed to check store',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 