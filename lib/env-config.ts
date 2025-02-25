// Environment variables with validation
export const env = {
  // Vercel API token for DNS and deployment operations
  VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN || '',
  
  // Vercel team ID for team-based operations
  VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID || '',
  
  // Neo4j connection details
  NEO4J_URI: process.env.NEO4J_URI || '',
  NEO4J_USER: process.env.NEO4J_USER || '',
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || '',
  
  // NextAuth configuration
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  
  // GitHub OAuth credentials
  GITHUB_ID: process.env.GITHUB_ID || '',
  GITHUB_SECRET: process.env.GITHUB_SECRET || '',
  
  // Email configuration
  EMAIL_FROM: process.env.EMAIL_FROM || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Validate required environment variables
  validate: () => {
    const missingVars = [];
    
    // Check for required variables in production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.NEXTAUTH_SECRET) missingVars.push('NEXTAUTH_SECRET');
      if (!process.env.NEO4J_URI) missingVars.push('NEO4J_URI');
      if (!process.env.NEO4J_USER) missingVars.push('NEO4J_USER');
      if (!process.env.NEO4J_PASSWORD) missingVars.push('NEO4J_PASSWORD');
    }
    
    // Always check for these variables
    if (!process.env.NEXTAUTH_URL) missingVars.push('NEXTAUTH_URL');
    
    if (missingVars.length > 0) {
      console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      return false;
    }
    
    return true;
  }
}; 