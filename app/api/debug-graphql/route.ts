import { NextResponse } from 'next/server';
import { driver } from '@/lib/neo4j';
import { auth } from '@/auth';

export async function GET() {
  try {
    console.log('Debug GraphQL API called');
    
    // Check Neo4j connection
    let neo4jStatus = 'unknown';
    let neo4jError = null;
    
    try {
      const session = driver.session();
      const result = await session.run('RETURN 1 as n');
      neo4jStatus = result.records[0].get('n').toNumber() === 1 ? 'connected' : 'error';
      await session.close();
    } catch (error) {
      neo4jStatus = 'error';
      neo4jError = error instanceof Error ? error.message : String(error);
    }
    
    // Check authentication
    const session = await auth();
    
    return NextResponse.json({
      success: true,
      message: 'GraphQL API endpoint is accessible',
      timestamp: new Date().toISOString(),
      neo4j: {
        status: neo4jStatus,
        error: neo4jError
      },
      auth: {
        isAuthenticated: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id || null
      },
      server: {
        node: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('Error in debug-graphql API:', error);
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