import { Session } from "next-auth"
import driver from "@/lib/neo4j"

export const resolvers = {
  Query: {
    me: async (parent: unknown, args: unknown, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      // Fetch the user from Neo4j to ensure all fields are populated
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (u:User {id: $id}) RETURN u { .id, .name, .email, .image } AS user`,
          { id: context.session.user.id }
        );

        const user = result.records[0]?.get("user");
        if (!user) throw new Error("User not found");

        // Ensure required fields have fallback values
        return {
          ...user,
          name: user.name || "Anonymous", // Fallback for null name
          email: user.email || "no-email@example.com", // Fallback for null email
        };
      } finally {
        await session.close();
      }
    },
    hello: () => "Hello from GraphQL!",
  },
  Mutation: {
    updateUser: async (
      parent: unknown,
      { input }: { input: { name?: string; email?: string; image?: string } },
      context: { session?: { user: { id: string } } }
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }
      const userId = context.session.user.id;
      const session = driver.session();
      try {
        const result = await session.run(
          `
            MATCH (u:User {id: $id})
            SET u.name = COALESCE($name, u.name, "Anonymous"),
                u.email = COALESCE($email, u.email, "no-email@example.com"),
                u.image = COALESCE($image, u.image)
            RETURN u { .id, .name, .email, .image, .roles } AS user
          `,
          {
            id: userId,
            name: input.name,
            email: input.email,
            image: input.image,
          }
        );
        const record = result.records[0];
        if (!record) throw new Error("User not found");
        return record.get("user");
      } finally {
        await session.close();
      }
    },
    deleteUser: async (parent: unknown, args: unknown, context: { session?: { user: { id: string } } }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }
      const userId = context.session.user.id;
      const session = driver.session();
      try {
        const result = await session.run(
          `
            MATCH (u:User {id: $id})
            DETACH DELETE u
            RETURN count(u) AS deletedCount
          `,
          { id: userId }
        );
        const count = result.records[0].get("deletedCount").toNumber();
        return count > 0;
      } finally {
        await session.close();
      }
    },
    dummy: () => "dummy",
  },
};
