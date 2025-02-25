import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  try {
    const subdomain = 'ghetto';
    
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
    const storeId = 'store-ghetto-' + Date.now();
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
        name: 'Ghetto Fabulous', 
        industry: 'Fashion', 
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
      exists: false,
      instructions: "Visit https://ghetto.joelmbaka.site to see your store"
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