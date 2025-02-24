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
  context: async (_req): Promise<{ session?: Session; user?: any }> => {
    // Get the session from the request
    const session = await auth();
    
    // Log the session for debugging (remove in production)
    console.log("GraphQL API Session:", session ? "Session exists" : "No session");
    
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

