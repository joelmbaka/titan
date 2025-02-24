import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  // Convert headers to a plain object
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  // Return headers and session info
  return NextResponse.json({
    headers,
    session: {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id || 'none',
      hasAccessToken: !!session?.accessToken,
      tokenPrefix: session?.accessToken ? session.accessToken.substring(0, 5) + '...' : 'none'
    }
  });
} 