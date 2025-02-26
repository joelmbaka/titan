import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/neo4j';
import { v4 as uuidv4 } from 'uuid';
import { setupStoreSubdomain } from '@/lib/subdomain-setup';

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

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { subdomain, name, industry } = body;
    
    if (!subdomain || !name || !industry) {
      return NextResponse.json({ 
        success: false,
        message: 'Subdomain, name, and industry are required' 
      }, { status: 400 });
    }
    
    console.log(`API - Creating test store with subdomain: ${subdomain}`);
    
    // Check if the subdomain is already in use
    const existingStore = await executeQuery(
      `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
      { subdomain }
    );
    
    if (existingStore.records.length > 0) {
      return NextResponse.json({ 
        success: false,
        message: `Subdomain ${subdomain} is already in use` 
      }, { status: 400 });
    }
    
    // Set up the subdomain first
    const storeId = uuidv4();
    const ownerId = 'test-user-' + uuidv4();
    
    const subdomainResult = await setupStoreSubdomain({
      id: storeId,
      name,
      subdomain,
      industry,
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        sales: 0,
        visitors: 0,
        conversion: 0
      }
    });
    
    if (!subdomainResult.success) {
      return NextResponse.json({ 
        success: false,
        message: `Failed to set up subdomain: ${subdomainResult.message}` 
      }, { status: 500 });
    }
    
    // Create the store in the database
    const result = await executeQuery(
      `
      CREATE (s:Store {
        id: $id,
        name: $name,
        subdomain: $subdomain,
        industry: $industry,
        ownerId: $ownerId,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN s
      `,
      {
        id: storeId,
        name,
        subdomain,
        industry,
        ownerId
      }
    );
    
    if (result.records.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Failed to create store in database' 
      }, { status: 500 });
    }
    
    const store = result.records[0].get('s').properties;
    
    return NextResponse.json({
      success: true,
      message: `Store created successfully with subdomain: ${subdomain}`,
      store: {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        industry: store.industry
      },
      subdomain: {
        result: subdomainResult
      }
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