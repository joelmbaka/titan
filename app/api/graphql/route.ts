import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { resolvers } from "./resolvers";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/auth";
import { Session } from "next-auth";

// Read the schema file
const typeDefs = readFileSync(join(process.cwd(), "app/api/graphql/schema.graphql"), "utf-8");

// Create the Apollo Server instance
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

// Define a type for the context
interface GraphQLContext {
  session?: Session;
  user?: Record<string, unknown>;
}

// Create the handler with proper typing
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req): Promise<GraphQLContext> => {
    // Get the session from the request
    const session = await auth();
    
    // Extract headers safely
    let authHeader: string | null = null;
    let sessionId: string | null = null;
    let authToken: string | null = null;
    
    try {
      // Check if headers exist and extract values
      if (req && 'headers' in req) {
        const headers = req.headers;
        
        // Handle different header object types
        if (headers instanceof Headers) {
          authHeader = headers.get('authorization');
          sessionId = headers.get('x-session-id');
          authToken = headers.get('x-auth-token');
        } else if (typeof headers === 'object' && headers !== null) {
          // Handle plain object headers
          authHeader = headers.authorization as string || null;
          sessionId = headers['x-session-id'] as string || null;
          authToken = headers['x-auth-token'] as string || null;
        }
      }
    } catch (error) {
      console.error('Error accessing request headers:', error);
    }
    
    // Log authentication info for debugging
    console.log("GraphQL API Auth:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id || 'none',
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader ? authHeader.substring(0, 10) + '...' : 'none',
      sessionIdHeader: sessionId || 'none',
      hasAuthToken: !!authToken
    });
    
    // If we don't have a session but we have a sessionId from headers, create a minimal user object
    let user: Record<string, unknown> | undefined = undefined;
    
    if (session?.user) {
      // Convert user to Record<string, unknown> to satisfy TypeScript
      user = { ...session.user } as Record<string, unknown>;
    } else if (sessionId) {
      // Create a minimal user object from the sessionId
      user = { id: sessionId };
      
      // If we have an auth token, add it to the user object
      if (authToken) {
        user.accessToken = authToken;
      }
    }
    
    // Return the context
    return { 
      session: session ?? undefined,
      user
    };
  },
});

// Export the route handlers
export const GET = async (request: Request) => {
  return handler(request);
};

export const POST = async (request: Request) => {
  return handler(request);
}; 