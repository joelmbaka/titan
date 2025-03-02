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
    
    console.log('Session retrieved:', session);
    // Log the session expiration time
    console.log('Session expires at:', session?.expires);
    // Log user information if available
    if (session?.user) {
      console.log('Authenticated user:', session.user);
    } else {
      console.log('No authenticated user found.');
    }
    
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }
    
    // Allow unauthenticated access for products page
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