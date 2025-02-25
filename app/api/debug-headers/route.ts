import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await auth();
    
    // Extract headers
    const headers = Object.fromEntries(request.headers.entries());
    
    // Sanitize authorization headers to avoid exposing tokens
    if (headers.authorization) {
      headers.authorization = headers.authorization.substring(0, 10) + '...';
    }
    
    if (headers.cookie) {
      headers.cookie = '(cookie content hidden)';
    }
    
    // Return headers and session info
    return NextResponse.json({
      headers,
      session: {
        exists: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id || 'none',
        userEmail: session?.user?.email || 'none',
        hasToken: !!session?.accessToken
      }
    });
  } catch (error: unknown) {
    console.error('Error in debug-headers API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get headers', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 