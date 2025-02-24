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

const getEnvVar = (name: string): string => {
  const value = process.env[name] || process.env[`NEXT_PUBLIC_${name}`];
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    return 'default_value'; // Provide a fallback value
  }
  return value;
};

const NEO4J_URI = getEnvVar("NEO4J_URI");
const NEO4J_USER = getEnvVar("NEO4J_USER");
const NEO4J_PASSWORD = getEnvVar("NEO4J_PASSWORD");

// Create and export the driver
export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 50,
    connectionTimeout: 30000,
  }
);

// Create a separate API route for Neo4j operations 