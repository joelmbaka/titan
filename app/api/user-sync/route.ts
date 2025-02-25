import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureUserInNeo4j, createTestStoreForUser } from '@/lib/user-sync';

export async function GET(_request: NextRequest) {
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
    
    console.log(`User sync API called for user: ${session.user.id}`);
    
    // Ensure user exists in Neo4j
    const userExists = await ensureUserInNeo4j(session);
    
    if (!userExists) {
      console.error(`Failed to ensure user exists in Neo4j: ${session.user.id}`);
      return NextResponse.json(
        { error: 'Failed to sync user with Neo4j', details: 'User creation failed' },
        { status: 500 }
      );
    }
    
    // If user exists, create a test store if needed
    let storeCreated = false;
    try {
      storeCreated = await createTestStoreForUser(session.user.id);
    } catch (storeError) {
      console.error('Error creating test store:', storeError);
      // Continue even if store creation fails
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      userId: session.user.id,
      userSynced: userExists,
      storeCreated
    });
  } catch (error) {
    console.error('Error in user-sync API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync user with Neo4j', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 