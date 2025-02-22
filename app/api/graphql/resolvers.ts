import { Session } from "next-auth"
import driver from "@/lib/neo4j"
import { CreateStoreInput } from "@/lib/types"

export const resolvers = {
  Store: {
    metrics: (store: any) => store.metrics || {
      sales: 0,
      visitors: 0,
      conversion: 0
    },
  },
  Query: {
    stores: async (_: unknown, __: unknown, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (s:Store {ownerId: $ownerId})
           RETURN s`,
          { ownerId: context.session.user.id }
        );
        return result.records.map(record => {
          const store = record.get('s').properties;
          return {
            ...store,
            createdAt: store.createdAt.toString(),
            updatedAt: store.updatedAt?.toString() || store.createdAt.toString(),
            metrics: store.metrics || {
              sales: 0,
              visitors: 0,
              conversion: 0
            }
          };
        });
      } finally {
        await session.close();
      }
    },
    store: async (_: unknown, { id }: { id: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (s:Store {id: $id, ownerId: $ownerId}) RETURN s`,
          { id, ownerId: context.session.user.id }
        );
        const store = result.records[0]?.get('s').properties;
        if (!store) throw new Error("Store not found");
        return store;
      } finally {
        await session.close();
      }
    },
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
    industries: async (_: unknown, __: unknown, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (c:Industry) RETURN c ORDER BY c.name`,
          {}
        );
        return result.records.map(record => record.get('c').properties);
      } finally {
        await session.close();
      }
    },
    industry: async (_: unknown, { id }: { id: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (c:Industry {id: $id}) RETURN c`,
          { id }
        );
        const industry = result.records[0]?.get('c').properties;
        if (!industry) throw new Error("Industry not found");
        return industry;
      } finally {
        await session.close();
      }
    }
  },
  Mutation: {
    createStore: async (_: unknown, { input }: { input: any }, context: { session?: Session }) => {
      if (!context.session?.user?.id) {
        throw new Error("Not authenticated - please sign in again");
      }

      console.log("Received store input:", input);

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (u:User {id: $ownerId})
           CREATE (s:Store {
             id: randomUUID(),
             name: $name,
             industry: $industry,
             subdomain: $subdomain,
             ownerId: $ownerId,
             createdAt: datetime(),
             updatedAt: datetime()
           })
           CREATE (u)-[:OWNS]->(s)
           RETURN s`,
          {
            name: input.name,
            industry: input.industry,
            subdomain: input.subdomain,
            ownerId: context.session.user.id,
          }
        );

        const store = result.records[0]?.get("s").properties;
        if (!store) throw new Error("Failed to create store");

        // Convert Neo4j datetime objects to strings
        store.createdAt = store.createdAt.toString();
        store.updatedAt = store.updatedAt.toString();

        return store;
      } catch (error) {
        console.error("Error creating store:", error);
        throw new Error(
          "Failed to create store: " + (error instanceof Error ? error.message : "Unknown error")
        );
      } finally {
        await session.close();
      }
    },
    updateStore: async (_: unknown, { id, input }: { id: string, input: any }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const setClauses = Object.keys(input)
          .map(key => {
            if (key === 'metrics') {
              return `s.metrics = ${JSON.stringify(input.metrics)}`;
            }
            return `s.${key} = $${key}`;
          })
          .join(', ');

        const result = await session.run(
          `MATCH (s:Store {id: $id, ownerId: $ownerId})
           SET ${setClauses}, s.updatedAt = datetime()
           RETURN s`,
          { id, ownerId: context.session.user.id, ...input }
        );
        const store = result.records[0]?.get('s').properties;
        if (!store) throw new Error("Store not found");
        return store;
      } finally {
        await session.close();
      }
    },
    deleteStore: async (_: unknown, { id }: { id: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (s:Store {id: $id, ownerId: $ownerId})
           DETACH DELETE s
           RETURN count(s) > 0 as deleted`,
          { id, ownerId: context.session.user.id }
        );
        return result.records[0].get('deleted');
      } finally {
        await session.close();
      }
    },
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
    createIndustry: async (_: unknown, { input }: { input: any }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `CREATE (c:Industry {
            id: $id,
            name: $name,
            description: $description,
            createdAt: datetime(),
            updatedAt: datetime()
          }) RETURN c`,
          {
            id: `industry-${Date.now()}`,
            ...input
          }
        );
        return result.records[0].get('c').properties;
      } finally {
        await session.close();
      }
    },
    updateIndustry: async (_: unknown, { id, input }: { id: string, input: any }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const setClauses = Object.keys(input)
          .map(key => `c.${key} = $${key}`)
          .join(', ');

        const result = await session.run(
          `MATCH (c:Industry {id: $id})
           SET ${setClauses}, c.updatedAt = datetime()
           RETURN c`,
          { id, ...input }
        );
        const industry = result.records[0]?.get('c').properties;
        if (!industry) throw new Error("Industry not found");
        return industry;
      } finally {
        await session.close();
      }
    },
  },
};
