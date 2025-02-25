import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/neo4j';

export async function GET() {
  try {
    console.log('Debug Neo4j API called');
    
    // Test Neo4j connection
    const testResult = await executeQuery('RETURN 1 as test');
    
    // Handle both Neo4j Integer objects and JavaScript numbers
    const testValue = testResult.records[0].get('test');
    const testNumber = typeof testValue === 'object' && testValue !== null && 'toNumber' in testValue 
      ? testValue.toNumber() 
      : Number(testValue);
    
    console.log('Neo4j connection test result:', testNumber);
    
    // Try to get user count
    const userCountResult = await executeQuery('MATCH (u:User) RETURN count(u) as userCount');
    const userCountValue = userCountResult.records[0].get('userCount');
    const userCount = typeof userCountValue === 'object' && userCountValue !== null && 'toNumber' in userCountValue
      ? userCountValue.toNumber()
      : Number(userCountValue);
    
    console.log('User count in Neo4j:', userCount);
    
    return NextResponse.json({
      success: true,
      neo4jTest: testNumber,
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in debug-neo4j API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 