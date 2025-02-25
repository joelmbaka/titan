import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the hostname from the request
    const hostname = request.headers.get('host') || '';
    const isSubdomainRequest = 
      hostname.includes('.joelmbaka.site') && 
      hostname.split('.')[0] !== 'www' && 
      hostname.split('.')[0] !== 'joelmbaka';
    
    console.log(`Session API called from ${hostname} (isSubdomain: ${isSubdomainRequest})`);
    
    // Get the session
    const session = await auth();
    
    // For subdomain requests, return a minimal session
    if (isSubdomainRequest) {
      return NextResponse.json({
        user: null,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // For regular requests, return the actual session
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error in session API:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
} 