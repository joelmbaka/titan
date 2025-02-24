import { driver } from '@/lib/neo4j';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST() {
  const session = driver.session();
  try {
    // Your Neo4j operations here
    return Response.json({ success: true });
  } finally {
    await session.close();
  }
} 