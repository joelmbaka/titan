import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getProductsByStoreId } from '@/lib/storeFunctions';

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await auth();
    console.log('Debug Session retrieved:', session);

    // Specify the store ID for testing
    const storeId = '894178a0-4c3b-4550-abcb-f3af2628da5f';
    const products = await getProductsByStoreId(storeId);
    
    console.log('Debug Products retrieved:', products);

    // Allow unauthenticated access
    if (!session) {
      return NextResponse.json({
        user: null,
        products,
      });
    }

    return NextResponse.json({
      session,
      products,
    });
  } catch (error) {
    console.error('Error in debugProducts API:', error);
    return NextResponse.json(
      { error: 'Failed to debug products' },
      { status: 500 }
    );
  }
} 