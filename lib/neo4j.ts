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
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

const NEO4J_URI = getEnvVar("NEO4J_URI");
const NEO4J_USERNAME = getEnvVar("NEO4J_USERNAME");
const NEO4J_PASSWORD = getEnvVar("NEO4J_PASSWORD");

interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  options?: {
    maxConnectionPoolSize?: number;
    connectionTimeout?: number;
  };
}

const config: Neo4jConfig = {
  uri: NEO4J_URI,
  username: NEO4J_USERNAME,
  password: NEO4J_PASSWORD,
  options: {
    maxConnectionPoolSize: 50,
    connectionTimeout: 30000
  }
};

const driver = neo4j.driver(
  config.uri,
  neo4j.auth.basic(config.username, config.password),
  config.options
);

// Ensure the driver is closed when the process exits
process.on('exit', () => {
  driver.close().catch((error) => {
    console.error('Error closing Neo4j driver:', error);
  });
});

export default driver; 