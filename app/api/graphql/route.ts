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
  context: async (): Promise<{ session?: Session }> => {
    const session = await auth();
    console.log('Session:', session);
    return { session: session ?? undefined };
  },
});

// Add explicit type annotations for Next.js route handler parameters
export const GET = async (request: Request) => {
  return handler(request);
};

export const POST = async (request: Request) => {
  return handler(request);
};

