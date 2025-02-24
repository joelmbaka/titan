import { getNeo4jConfig } from '@/lib/env';
import neo4j from 'neo4j-driver';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST() {
  const { uri, user, password } = getNeo4jConfig();
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  try {
    // Your Neo4j operations here
    return Response.json({ success: true });
  } finally {
    await driver.close();
  }
} 