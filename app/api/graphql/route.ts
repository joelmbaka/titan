import getServerSession from "next-auth";
import { NextRequest } from "next/server";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/auth";
import { resolvers } from "./resolvers";

// Read the schema file
const typeDefs = readFileSync(join(process.cwd(), "app/api/graphql/schema.graphql"), {
  encoding: "utf-8",
});

// Create the Apollo Server instance
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async () => {
    const session = await auth();
    return { 
      session: session || undefined
    };
  },
});

export { handler as GET, handler as POST };

