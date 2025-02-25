import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeQuery } from '@/lib/neo4j';
import { setupStoreSubdomain } from '@/lib/subdomain-setup';

export async function POST(request: NextRequest) {
  try {
    // Get the session
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', details: 'No user session found' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { storeId, subdomain } = body;
    
    if (!storeId && !subdomain) {
      return NextResponse.json(
        { error: 'Missing parameters', details: 'Either storeId or subdomain is required' },
        { status: 400 }
      );
    }
    
    // Find the store
    let storeQuery = '';
    let queryParams = {};
    
    if (storeId) {
      storeQuery = `MATCH (s:Store {id: $storeId}) RETURN s`;
      queryParams = { storeId };
    } else {
      storeQuery = `MATCH (s:Store {subdomain: $subdomain}) RETURN s`;
      queryParams = { subdomain };
    }
    
    const result = await executeQuery(storeQuery, queryParams);
    
    if (result.records.length === 0) {
      return NextResponse.json(
        { error: 'Store not found', details: 'No store found with the provided ID or subdomain' },
        { status: 404 }
      );
    }
    
    const store = result.records[0].get('s').properties;
    
    // Check if the user owns this store
    const ownershipCheck = await executeQuery(
      `MATCH (u:User {id: $userId})-[:OWNS]->(s:Store {id: $storeId}) RETURN s`,
      { userId: session.user.id, storeId: store.id }
    );
    
    if (ownershipCheck.records.length === 0) {
      return NextResponse.json(
        { error: 'Permission denied', details: 'You do not own this store' },
        { status: 403 }
      );
    }
    
    // Set up the subdomain
    const setupResult = await setupStoreSubdomain(store);
    
    return NextResponse.json({
      success: setupResult.success,
      message: setupResult.message,
      store: {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        url: `https://${store.subdomain}.joelmbaka.site`
      }
    });
  } catch (error) {
    console.error('Error in setup-subdomain API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 