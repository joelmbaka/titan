// This file handles synchronizing users between NextAuth and Neo4j
import { executeQuery } from "./neo4j";
import { Session } from "next-auth";

// Define error types
interface Neo4jError extends Error {
  message: string;
  code?: string;
}

// Function to ensure a user exists in Neo4j
export async function ensureUserInNeo4j(session: Session): Promise<boolean> {
  if (!session?.user?.id) {
    console.error("Cannot sync user - missing user ID in session");
    return false;
  }

  try {
    console.log(`Ensuring user exists in Neo4j: ${session.user.id}`);
    
    // First check if the user already exists by ID
    const checkByIdResult = await executeQuery(
      `MATCH (u:User {id: $id}) RETURN u`,
      { id: session.user.id }
    );
    
    // If user exists by ID, return true
    if (checkByIdResult.records.length > 0) {
      console.log(`User ${session.user.id} already exists in Neo4j`);
      return true;
    }
    
    // If user doesn't exist by ID, check if a user with the same email exists
    if (session.user.email) {
      const checkByEmailResult = await executeQuery(
        `MATCH (u:User {email: $email}) RETURN u`,
        { email: session.user.email }
      );
      
      // If a user with the same email exists, update that user with the new ID
      if (checkByEmailResult.records.length > 0) {
        console.log(`User with email ${session.user.email} already exists, updating with new ID ${session.user.id}`);
        const updateResult = await executeQuery(
          `MATCH (u:User {email: $email})
           SET u.id = $id,
               u.name = $name,
               u.image = $image,
               u.updatedAt = datetime()
           RETURN u`,
          {
            email: session.user.email,
            id: session.user.id,
            name: session.user.name || "Anonymous",
            image: session.user.image || ""
          }
        );
        
        const userUpdated = updateResult.records.length > 0;
        console.log(`User update result: ${userUpdated ? "Success" : "Failed"}`);
        
        return userUpdated;
      }
    }
    
    // User doesn't exist by ID or email, create a new user
    console.log(`Creating new user in Neo4j: ${session.user.id}`);
    const createResult = await executeQuery(
      `CREATE (u:User {
        id: $id,
        name: $name,
        email: $email,
        image: $image,
        createdAt: datetime()
      }) RETURN u`,
      {
        id: session.user.id,
        name: session.user.name || "Anonymous",
        email: session.user.email || `no-email-${Date.now()}@example.com`, // Make email unique with timestamp
        image: session.user.image || ""
      }
    );
    
    // Check if user was created successfully
    const userCreated = createResult.records.length > 0;
    console.log(`User creation result: ${userCreated ? "Success" : "Failed"}`);
    
    return userCreated;
  } catch (error: unknown) {
    const typedError = error as Neo4jError;
    console.error("Error ensuring user in Neo4j:", typedError?.message || String(error));
    
    // Try one more time with a completely unique email as a fallback
    if (typedError?.message && typedError.message.includes("property uniqueness constraint violated")) {
      try {
        console.log(`Retrying user creation with unique email for user: ${session.user.id}`);
        const fallbackResult = await executeQuery(
          `CREATE (u:User {
            id: $id,
            name: $name,
            email: $email,
            image: $image,
            createdAt: datetime()
          }) RETURN u`,
          {
            id: session.user.id,
            name: session.user.name || "Anonymous",
            email: `user-${session.user.id}-${Date.now()}@example.com`, // Guaranteed unique email
            image: session.user.image || ""
          }
        );
        
        const userCreated = fallbackResult.records.length > 0;
        console.log(`Fallback user creation result: ${userCreated ? "Success" : "Failed"}`);
        
        return userCreated;
      } catch (fallbackError: unknown) {
        const typedFallbackError = fallbackError as Neo4jError;
        console.error("Error in fallback user creation:", typedFallbackError?.message || String(fallbackError));
        return false;
      }
    }
    
    return false;
  }
}

// Function to create a test store for a new user
export async function createTestStoreForUser(userId: string): Promise<boolean> {
  try {
    console.log(`Creating test store for user: ${userId}`);
    
    // Check if user already has stores
    const checkResult = await executeQuery(
      `MATCH (u:User {id: $userId})-[:OWNS]->(s:Store) RETURN count(s) as storeCount`,
      { userId }
    );
    
    // Handle both Neo4j Integer objects and JavaScript numbers
    const storeCountValue = checkResult.records[0].get('storeCount');
    const storeCount = typeof storeCountValue === 'object' && storeCountValue !== null && 'toNumber' in storeCountValue
      ? storeCountValue.toNumber()
      : Number(storeCountValue);
    
    if (storeCount > 0) {
      console.log(`User ${userId} already has ${storeCount} stores, skipping test store creation`);
      return true;
    }
    
    // Create a test store for the user
    const createResult = await executeQuery(
      `MATCH (u:User {id: $userId})
       CREATE (s:Store {
         id: apoc.create.uuid(),
         name: 'My Test Store',
         industry: 'Retail',
         subdomain: $subdomain,
         ownerId: $userId,
         createdAt: datetime(),
         updatedAt: datetime()
       })
       CREATE (u)-[:OWNS]->(s)
       RETURN s`,
      { 
        userId,
        subdomain: `test-store-${Date.now()}`
      }
    );
    
    const storeCreated = createResult.records.length > 0;
    console.log(`Test store creation result: ${storeCreated ? "Success" : "Failed"}`);
    
    return storeCreated;
  } catch (error: unknown) {
    const typedError = error as Neo4jError;
    console.error("Error creating test store:", typedError?.message || String(error));
    return false;
  }
}

// This function can be called from different places to sync user data
export async function syncUser(session: Session): Promise<boolean> {
  if (!session?.user?.id) {
    console.error("Cannot sync user - missing user ID in session");
    return false;
  }

  // Logic to check if user exists, update or create user
  const userExists = await ensureUserInNeo4j(session);
  return userExists;
} 