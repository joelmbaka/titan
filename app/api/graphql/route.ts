import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/auth";
import { resolvers } from "./resolvers";
import { NextRequest } from "next/server";

// Read the schema file
const typeDefs = readFileSync(join(process.cwd(), "app/api/graphql/schema.graphql"), {
  encoding: "utf-8",
});

// Create the Apollo Server instance
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create the Next.js API route handler
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async () => {
    const session = await auth();
    return { 
      session: session?.user?.id ? { user: { id: session.user.id } } : undefined 
    };
  },
});

// Export GET and POST so that the endpoint works for both methods
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
