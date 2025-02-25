import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  try {
    // Check if a store with this subdomain already exists
    const checkResult = await executeQuery(
      `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
      { subdomain: 'carlist' }
    );
    
    if (checkResult.records.length > 0) {
      const store = checkResult.records[0].get('s').properties;
      return NextResponse.json({
        success: true,
        message: 'Store already exists',
        store
      });
    }
    
    // Create the store if it doesn't exist
    const storeId = 'test-' + Date.now();
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
        name: 'Car Listings', 
        industry: 'Automotive', 
        subdomain: 'carlist', 
        ownerId: 'test-user', 
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
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    console.error('Error creating test store:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create test store',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 