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

const handler = startServerAndCreateNextHandler(apolloServer, {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  context: async (req): Promise<{ session?: Session; user?: any }> => {
    // Get the session from the request
    const session = await auth();
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    const sessionId = req.headers.get('x-session-id');
    
    // Log detailed authentication info for debugging
    console.log("GraphQL API Auth:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id || 'none',
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader ? authHeader.substring(0, 10) + '...' : 'none',
      sessionIdHeader: sessionId || 'none'
    });
    
    // Return the session and user in the context
    return { 
      session: session ?? undefined,
      user: session?.user
    };
  },
});

// Add explicit type annotations for Next.js route handler parameters
export const GET = async (request: Request) => {
  return handler(request);
};

export const POST = async (request: Request) => {
  return handler(request);
};

