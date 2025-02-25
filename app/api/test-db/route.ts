import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  try {
    // Test the database connection
    const result = await executeQuery(
      `MATCH (n) RETURN count(n) as count LIMIT 1`
    );
    
    const count = result.records[0].get('count').toNumber();
    
    // Get all stores
    const storesResult = await executeQuery(
      `MATCH (s:Store) RETURN s LIMIT 10`
    );
    
    const stores = storesResult.records.map(record => {
      const store = record.get('s').properties;
      return {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        industry: store.industry
      };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      nodeCount: count,
      stores
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 