import { Session } from "next-auth";
import { executeQuery } from "@/api/graphql/neo4j";
import { Record as Neo4jRecord } from "neo4j-driver";

interface Store {
  metrics?: {
    sales: number;
    visitors: number;
    conversion: number;
  };
}

interface CreateStoreInput {
  name: string;
  industry: string;
  subdomain: string;
}

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  sku: string;
  category: string;
  storeId: string;
  inventory?: number;
  status?: string;
}

interface CreateBlogPostInput {
  title: string;
  content: string;
  metaDescription: string;
  tags: string[];
  category: string;
  storeId: string;
  status?: string;
}

interface UpdateBlogPostInput {
  title?: string;
  content?: string;
  metaDescription?: string;
  tags?: string[];
  category?: string;
  status?: string;
}

export const combinedResolvers = {
  Store: {
    metrics: (store: Store) =>
      store.metrics || {
        sales: 0,
        visitors: 0,
        conversion: 0,
      },
    owner: async (store: { id: string }) => {
      try {
        const result = await executeQuery(
          `MATCH (u:User)-[:OWNS]->(s:Store {id: $storeId})
           RETURN u`,
          { storeId: store.id },
        );

        if (result.records.length === 0) {
          throw new Error(`No owner found for store with ID: ${store.id}`);
        }

        const user = result.records[0].get("u").properties;
        return {
          ...user,
          roles: user.roles || ["USER"],
        };
      } catch (error: unknown) {
        console.error(`Error fetching owner for store ${store.id}:`, error);
        throw new Error(
          `Failed to fetch store owner: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  },
  Query: {
    stores: async (
      _: unknown,
      __: unknown,
      context: { session?: Session; user?: Record<string, unknown> }
    ) => {
      console.log("Stores resolver context:", {
        hasSession: !!context.session,
        hasUser: !!context.user,
        userId: context.user?.id || context.session?.user?.id || "none",
        sessionInfo: context.session ? "present" : "missing"
      });

      if (!context.session && !context.user) {
        console.error("Authentication missing in stores resolver");
        throw new Error("Authentication required");
      }

      // Get the user ID from either source
      const userId = context.user?.id || context.session?.user?.id;

      if (!userId) {
        console.error("User ID missing in authenticated context");
        throw new Error("User ID required");
      }

      try {
        console.log("Executing Neo4j query with params:", { ownerId: userId });

        // Test Neo4j connection first
        try {
          const testResult = await executeQuery('RETURN 1 as test');
          // Handle both Neo4j Integer objects and JavaScript numbers
          const testValue = testResult.records[0].get('test');
          const testNumber = typeof testValue === 'object' && testValue !== null && 'toNumber' in testValue 
            ? testValue.toNumber() 
            : Number(testValue);

          console.log('Neo4j connection test:', testNumber === 1 ? 'OK' : `Unexpected value: ${testNumber}`);
        } catch (testError: unknown) {
          console.error('Neo4j connection test failed:', testError);
          throw new Error(`Neo4j connection failed: ${testError instanceof Error ? testError.message : String(testError)}`);
        }

        // Now run the actual query
        const result = await executeQuery(
          `MATCH (u:User {id: $ownerId})-[:OWNS]->(s:Store) RETURN s`,
          { ownerId: userId }
        );

        console.log('Neo4j query result:', {
          recordCount: result.records.length
        });

        return result.records.map((record: Neo4jRecord) => {
          const store = record.get('s').properties;
          return {
            ...store,
            createdAt: store.createdAt.toString(),
            updatedAt: store.updatedAt?.toString() || store.createdAt.toString(),
            metrics: store.metrics || {
              sales: 0,
              visitors: 0,
              conversion: 0,
            }
          };
        });
      } catch (error: unknown) {
        console.error('Stores query error:', error);
        throw new Error(`Failed to fetch stores: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    store: async (_: unknown, { id }: { id: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (s:Store {id: $id, ownerId: $ownerId}) RETURN s`,
          { id, ownerId: context.session.user.id }
        );
        const store = result.records[0]?.get('s').properties;
        if (!store) throw new Error("Store not found");
        return store;
      } catch (error: unknown) {
        console.error('Error fetching store:', error);
        throw new Error(`Failed to fetch store: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    me: async (parent: unknown, args: unknown, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        // First try to find the user by ID
        const result = await executeQuery(
          `MATCH (u:User {id: $id}) RETURN u { .id, .name, .email, .image } AS user`,
          { id: context.session.user.id }
        );

        let user = result.records[0]?.get("user");

        // If user not found by ID, try to find by email
        if (!user && context.session.user.email) {
          console.log(`User not found by ID, trying email: ${context.session.user.email}`);
          const emailResult = await executeQuery(
            `MATCH (u:User {email: $email}) RETURN u { .id, .name, .email, .image } AS user`,
            { email: context.session.user.email }
          );

          user = emailResult.records[0]?.get("user");

          // If found by email but ID doesn't match, update the ID
          if (user && user.id !== context.session.user.id) {
            console.log(`Updating user ID from ${user.id} to ${context.session.user.id}`);
            await executeQuery(
              `MATCH (u:User {email: $email}) SET u.id = $newId RETURN u`,
              { email: context.session.user.email, newId: context.session.user.id }
            );
            user.id = context.session.user.id;
          }
        }

        // If user still not found, create a new user
        if (!user) {
          console.log(`User not found, creating new user: ${context.session.user.id}`);
          try {
            const createResult = await executeQuery(
              `CREATE (u:User {
                id: $id,
                name: $name,
                email: $email,
                image: $image,
                createdAt: datetime()
              }) RETURN u { .id, .name, .email, .image } AS user`,
              {
                id: context.session.user.id,
                name: context.session.user.name || "Anonymous",
                email: context.session.user.email || `user-${context.session.user.id}-${Date.now()}@example.com`,
                image: context.session.user.image || ""
              }
            );

            user = createResult.records[0]?.get("user");
          } catch (createError: unknown) {
            console.error("Error creating user in GraphQL resolver:", createError);

            // If creation fails due to uniqueness constraint, use a guaranteed unique email
            if (createError instanceof Error && createError.message && createError.message.includes("uniqueness constraint")) {
              const fallbackResult = await executeQuery(
                `CREATE (u:User {
                  id: $id,
                  name: $name,
                  email: $email,
                  image: $image,
                  createdAt: datetime()
                }) RETURN u { .id, .name, .email, .image } AS user`,
                {
                  id: context.session.user.id,
                  name: context.session.user.name || "Anonymous",
                  email: `user-${context.session.user.id}-${Date.now()}@example.com`,
                  image: context.session.user.image || ""
                }
              );

              user = fallbackResult.records[0]?.get("user");
            } else {
              throw createError;
            }
          }
        }

        if (!user) throw new Error("Failed to find or create user");

        // Ensure required fields have fallback values
        return {
          ...user,
          name: user.name || "Anonymous", // Fallback for null name
          email: user.email || "no-email@example.com", // Fallback for null email
        };
      } catch (error: unknown) {
        console.error("Error in me resolver:", error);
        throw new Error(`Failed to get user: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    hello: () => "Hello from GraphQL!",
    industries: async (_: unknown, __: unknown, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (c:Industry) RETURN c ORDER BY c.name`,
          {}
        );
        return result.records.map(record => record.get('c').properties);
      } catch (error: unknown) {
        console.error('Error fetching industries:', error);
        throw new Error(`Failed to fetch industries: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    industry: async (_: unknown, { id }: { id: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (c:Industry {id: $id}) RETURN c`,
          { id }
        );
        const industry = result.records[0]?.get('c').properties;
        if (!industry) throw new Error("Industry not found");
        return industry;
      } catch (error: unknown) {
        console.error('Error fetching industry:', error);
        throw new Error(`Failed to fetch industry: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    products: async (_: unknown, { storeId }: { storeId: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (p:Product {storeId: $storeId})
           RETURN p ORDER BY p.createdAt DESC`,
          { storeId }
        );

        return result.records.map(record => {
          const product = record.get('p').properties;
          return {
            ...product,
            createdAt: product.createdAt.toString(),
            updatedAt: product.updatedAt.toString()
          };
        });
      } catch (error: unknown) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    blogPosts: async (_: unknown, { storeId }: { storeId: string }, context: { session?: Session }) => {
      // This resolver is now handled in the main resolvers file.
    },
    blogPost: async (_: unknown, { id }: { id: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (b:BlogPost {id: $id})
           RETURN b`,
          { id }
        );
        const blogPost = result.records[0]?.get('b').properties;
        if (!blogPost) throw new Error("Blog post not found");
        return {
          ...blogPost,
          createdAt: blogPost.createdAt.toString(),
          updatedAt: blogPost.updatedAt.toString()
        };
      } catch (error: unknown) {
        console.error('Error fetching blog post:', error);
        throw new Error(`Failed to fetch blog post: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    storeBySubdomain: async (_: unknown, { subdomain }: { subdomain: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
          { subdomain }
        );
        const store = result.records[0]?.get('s').properties;
        if (!store) throw new Error("Store not found");
        return store;
      } catch (error: unknown) {
        console.error('Error fetching store by subdomain:', error);
        throw new Error(`Failed to fetch store by subdomain: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  },
  Mutation: {
    createStore: async (_: unknown, { input }: { input: CreateStoreInput }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `CREATE (s:Store {
            id: apoc.create.uuid(),
            name: $name,
            industry: $industry,
            subdomain: $subdomain,
            createdAt: datetime(),
            updatedAt: datetime()
          }) RETURN s`,
          input
        );
        return result.records[0]?.get('s').properties;
      } finally {
        await session.close();
      }
    },
    updateStore: async (_: unknown, { id, input }: { id: string; input: UpdateStoreInput }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (s:Store {id: $id}) SET s += $input RETURN s`,
          { id, input }
        );
        return result.records[0]?.get('s').properties;
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
          `MATCH (s:Store {id: $id}) DETACH DELETE s RETURN count(s) > 0 as deleted`,
          { id }
        );
        return result.records[0]?.get('deleted');
      } finally {
        await session.close();
      }
    },
  },
}; 