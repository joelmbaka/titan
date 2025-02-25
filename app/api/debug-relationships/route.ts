import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/neo4j';
import { auth } from '@/auth';
import { Record } from 'neo4j-driver';

export async function GET() {
  try {
    console.log('Debug Relationships API called');
    
    // Get the session
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', details: 'No user session found' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log(`Checking relationships for user: ${userId}`);
    
    // Check if user exists
    const userResult = await executeQuery(
      `MATCH (u:User {id: $userId}) RETURN u`,
      { userId }
    );
    
    const userExists = userResult.records.length > 0;
    
    // Check user-store relationships
    const relationshipResult = await executeQuery(
      `MATCH (u:User {id: $userId})-[r:OWNS]->(s:Store) 
       RETURN s.id as storeId, s.name as storeName, type(r) as relationshipType`,
      { userId }
    );
    
    // Check stores without relationships
    const orphanedStoresResult = await executeQuery(
      `MATCH (s:Store) 
       WHERE NOT (s)<-[:OWNS]-() 
       RETURN s.id as storeId, s.name as storeName`,
      {}
    );
    
    // Fix missing relationships if needed
    const fixedRelationships = [];
    if (userExists && orphanedStoresResult.records.length > 0) {
      console.log(`Found ${orphanedStoresResult.records.length} orphaned stores, attempting to fix`);
      
      for (const record of orphanedStoresResult.records as Record[]) {
        const storeId = record.get('storeId');
        
        // Create the missing OWNS relationship
        const fixResult = await executeQuery(
          `MATCH (u:User {id: $userId}), (s:Store {id: $storeId})
           WHERE NOT (u)-[:OWNS]->(s)
           CREATE (u)-[r:OWNS]->(s)
           RETURN s.id as storeId, s.name as storeName, type(r) as relationshipType`,
          { userId, storeId }
        );
        
        if (fixResult.records.length > 0) {
          fixedRelationships.push({
            storeId: fixResult.records[0].get('storeId'),
            storeName: fixResult.records[0].get('storeName'),
            relationshipType: fixResult.records[0].get('relationshipType')
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      userId,
      userExists,
      relationships: relationshipResult.records.map((record: Record) => ({
        storeId: record.get('storeId'),
        storeName: record.get('storeName'),
        relationshipType: record.get('relationshipType')
      })),
      orphanedStores: orphanedStoresResult.records.map((record: Record) => ({
        storeId: record.get('storeId'),
        storeName: record.get('storeName')
      })),
      fixedRelationships,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in debug-relationships API:', error);
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