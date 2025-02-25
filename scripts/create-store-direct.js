// Direct Neo4j connection script to create a test store
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Neo4j connection details
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://your-neo4j-instance.neo4j.io';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'your-password';

// Create a Neo4j driver instance
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
);

async function createTestStore() {
  const session = driver.session();
  
  try {
    // First check if a store with this subdomain already exists
    const checkResult = await session.run(
      `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
      { subdomain: 'carlist' }
    );
    
    if (checkResult.records.length > 0) {
      console.log('Store with subdomain "carlist" already exists:', 
        checkResult.records[0].get('s').properties);
      return;
    }
    
    // Create the store if it doesn't exist
    const storeId = 'test-' + Date.now();
    const result = await session.run(
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
    
    console.log('Store created:', result.records[0].get('s').properties);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await session.close();
  }
  
  // Close the driver
  await driver.close();
}

createTestStore(); 