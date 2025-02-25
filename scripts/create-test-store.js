// Script to create a test store with the subdomain 'carlist'
import { executeQuery } from '../lib/neo4j.js';

async function createTestStore() {
  try {
    const storeId = 'test-' + Date.now();
    
    // First check if a store with this subdomain already exists
    const checkResult = await executeQuery(
      `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
      { subdomain: 'carlist' }
    );
    
    if (checkResult.records.length > 0) {
      console.log('Store with subdomain "carlist" already exists:', 
        checkResult.records[0].get('s').properties);
      return;
    }
    
    // Create the store if it doesn't exist
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
    
    console.log('Store created:', result.records[0].get('s').properties);
  } catch (e) {
    console.error('Error:', e);
  }
}

createTestStore(); 