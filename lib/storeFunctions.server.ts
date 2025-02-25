import { executeQuery } from '@/lib/neo4j';

// Define the Store type
export interface Store {
  id: string;
  name: string;
  subdomain: string;
  industry: string;
  metrics?: {
    sales: number;
    visitors: number;
    conversion: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Server-side function to get a store by subdomain
 * This uses direct Neo4j queries instead of GraphQL
 */
export async function getStoreBySubdomain(subdomain: string): Promise<Store | null> {
  try {
    console.log(`Server - Fetching store with subdomain: ${subdomain}`);
    
    const result = await executeQuery(
      `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
      { subdomain }
    );
    
    if (result.records.length === 0) {
      console.log(`Server - No store found with subdomain: ${subdomain}`);
      return null;
    }
    
    const storeProps = result.records[0].get("s").properties;
    console.log(`Server - Found store: ${storeProps.name}`);
    
    // Convert Neo4j properties to a plain JavaScript object
    const store: Store = {
      id: storeProps.id,
      name: storeProps.name,
      subdomain: storeProps.subdomain,
      industry: storeProps.industry,
      metrics: storeProps.metrics || {
        sales: 0,
        visitors: 0,
        conversion: 0
      },
      createdAt: storeProps.createdAt?.toString(),
      updatedAt: storeProps.updatedAt?.toString()
    };
    
    return store;
  } catch (error) {
    console.error(`Server - Error fetching store by subdomain ${subdomain}:`, error);
    return null;
  }
} 