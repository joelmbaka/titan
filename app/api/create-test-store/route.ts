import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  try {
    // Get the subdomain from the query parameters or use the default
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain') || 'startupstarter';
    
    // Check if a store with this subdomain already exists
    const checkResult = await executeQuery(
      `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
      { subdomain }
    );
    
    if (checkResult.records.length > 0) {
      const store = checkResult.records[0].get('s').properties;
      return NextResponse.json({
        success: true,
        message: `Store with subdomain "${subdomain}" already exists`,
        store,
        exists: true
      });
    }
    
    // Create the store if it doesn't exist
    const storeId = 'store-' + Date.now();
    const result = await executeQuery(
      `CREATE (s:Store {
        id: $id, 
        name: $name, 
        industry: $industry, 
        subdomain: $subdomain, 
        ownerId: $ownerId, 
        createdAt: datetime(), 
        updatedAt: datetime(), 
        metrics: $metrics
      }) RETURN s`,
      { 
        id: storeId, 
        name: 'Startup Starter', 
        industry: 'Technology', 
        subdomain: subdomain, 
        ownerId: 'system', 
        metrics: { 
          sales: 0, 
          visitors: 0, 
          conversion: 0 
        } 
      }
    );
    
    const store = result.records[0].get('s').properties;
    
    return NextResponse.json({
      success: true,
      message: `Store with subdomain "${subdomain}" created successfully`,
      store,
      exists: false
    });
  } catch (error) {
    console.error('Error creating/checking store:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create/check store',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 