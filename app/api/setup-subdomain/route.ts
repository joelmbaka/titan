import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { setupStoreSubdomain } from '@/lib/subdomain-setup';
import { executeQuery } from '@/lib/neo4j';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get store ID from request body
    const { storeId } = await req.json();
    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    console.log(`Setting up subdomain for store ID: ${storeId}`);

    // Get store from database
    const result = await executeQuery(
      `
      MATCH (s:Store {id: $storeId})
      RETURN s
      `,
      { storeId }
    );

    const store = result.records[0]?.get('s')?.properties;
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if user owns the store
    const ownershipResult = await executeQuery(
      `
      MATCH (u:User {email: $email})-[:OWNS]->(s:Store {id: $storeId})
      RETURN s
      `,
      { 
        email: session.user.email,
        storeId 
      }
    );

    if (ownershipResult.records.length === 0) {
      return NextResponse.json(
        { error: 'You don\'t have permission to set up this store\'s subdomain' },
        { status: 403 }
      );
    }

    // Set up subdomain
    const setupResult = await setupStoreSubdomain(store);

    if (!setupResult.success) {
      // Check if the error is because the subdomain already exists
      if (setupResult.message.includes('already exists')) {
        return NextResponse.json(
          { 
            error: setupResult.message,
            code: 'SUBDOMAIN_EXISTS',
            suggestion: 'Please update your store with a different subdomain name.'
          },
          { status: 409 } // Conflict status code
        );
      }
      
      return NextResponse.json(
        { error: setupResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: setupResult.message,
      subdomain: `${store.subdomain}.joelmbaka.site`
    });
  } catch (error) {
    console.error('Error setting up subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to set up subdomain' },
      { status: 500 }
    );
  }
} 