// Add at the very top
if (process.env.NEXT_RUNTIME === 'edge') {
  throw new Error('Neo4j driver is not compatible with Edge runtime');
}

// Add server-side guard at the top
if (typeof window !== 'undefined') {
  throw new Error('Neo4j driver cannot be used in client-side code');
}

import neo4j from "neo4j-driver";

// Debugging: Log environment variables (commented out for production)
// console.log("NEO4J_URI:", process.env.NEO4J_URI);
// console.log("NEO4J_USERNAME:", process.env.NEO4J_USERNAME);
// console.log("NEO4J_PASSWORD:", process.env.NEO4J_PASSWORD);

// Improved environment variable handling
const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    throw new Error(`Required environment variable ${name} is missing`);
  }
  return value;
};

// Get Neo4j connection details from environment variables
const NEO4J_URI = getEnvVar("NEO4J_URI");
const NEO4J_USER = getEnvVar("NEO4J_USER");
const NEO4J_PASSWORD = getEnvVar("NEO4J_PASSWORD");

// Log connection attempt (without exposing credentials)
console.log(`Connecting to Neo4j at ${NEO4J_URI} with user ${NEO4J_USER}`);

// Create and export the driver with improved configuration
export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 50,
    connectionTimeout: 30000, // 30 seconds
    connectionAcquisitionTimeout: 10000, // 10 seconds
    maxTransactionRetryTime: 30000, // 30 seconds
    logging: {
      level: 'info',
      logger: (level, message) => console.log(`[Neo4j ${level}]: ${message}`)
    },
    disableLosslessIntegers: true, // Convert Neo4j integers to JavaScript numbers
  }
);

// Verify connection on startup with retry logic
(async () => {
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      const session = driver.session();
      try {
        console.log(`Neo4j connection attempt ${retries + 1}/${maxRetries}...`);
        const result = await session.run('RETURN 1 AS test');
        const testValue = result.records[0].get('test');
        
        console.log('Neo4j connection successful:', 
          testValue === 1 ? 'OK' : `Unexpected value: ${testValue}`);
        
        // Connection successful, exit retry loop
        break;
      } finally {
        await session.close();
      }
    } catch (error) {
      retries++;
      console.error(`Neo4j connection test failed (attempt ${retries}/${maxRetries}):`, error);
      
      if (retries >= maxRetries) {
        console.error('Max Neo4j connection retries reached. Continuing with potentially unstable connection.');
      } else {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        console.log(`Retrying Neo4j connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
})();

// Helper function to get a session with retry logic
export async function getSession(retries = 3) {
  let attempt = 0;
  let lastError;
  
  while (attempt < retries) {
    try {
      return driver.session();
    } catch (error) {
      lastError = error;
      attempt++;
      console.error(`Failed to get Neo4j session (attempt ${attempt}/${retries}):`, error);
      
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to get Neo4j session after multiple attempts');
}

// Helper function to execute a query with retry logic
export async function executeQuery(cypher: string, params = {}, retries = 3) {
  let attempt = 0;
  let lastError;
  
  while (attempt < retries) {
    const session = await getSession();
    try {
      return await session.run(cypher, params);
    } catch (error) {
      lastError = error;
      attempt++;
      console.error(`Query execution failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } finally {
      await session.close();
    }
  }
  
  throw lastError || new Error('Query execution failed after multiple attempts');
}

// Create a separate API route for Neo4j operations 