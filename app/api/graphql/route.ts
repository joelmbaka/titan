import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { resolvers } from "./resolvers";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
    try {
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
        hasAuthToken: !!authToken,
        requestMethod: req.method,
        requestUrl: req.url,
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
    } catch (error) {
      console.error('Error creating GraphQL context:', error);
      return {}; // Return empty context on error
    }
  },
});

// Wrapper function to handle errors
const safeHandler = async (request: Request | NextRequest) => {
  try {
    // Log the incoming request
    console.log('GraphQL API request:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    // Clone the request to ensure it can be read
    const clonedRequest = request.clone();
    
    // Try to parse the request body to validate it's proper JSON
    try {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await clonedRequest.json();
        console.log('GraphQL request body:', {
          query: body.query?.substring(0, 100) + (body.query?.length > 100 ? '...' : ''),
          variables: body.variables,
          operationName: body.operationName
        });
        
        // If we got here, we have a valid JSON body, proceed with the handler
        return handler(request);
      }
      
      // If content type is not application/json, check if it's a GET request
      if (request.method === 'GET') {
        return handler(request);
      }
      
      // Otherwise, return an error
      return NextResponse.json(
        { errors: [{ message: 'Invalid content type: application/json required' }] },
        { status: 400 }
      );
    } catch (parseError) {
      console.error('Invalid JSON in GraphQL request:', parseError);
      return NextResponse.json(
        { errors: [{ message: 'Invalid JSON in request body' }] },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in GraphQL API:', error);
    return NextResponse.json(
      { 
        errors: [{ 
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }]
      },
      { status: 500 }
    );
  }
};

// Export the route handlers
export const GET = async (request: Request) => {
  console.log('GraphQL GET request received');
  return safeHandler(request);
};

export const POST = async (request: Request) => {
  console.log('GraphQL POST request received');
  return safeHandler(request);
}; 