import { Session } from "next-auth";
import { driver, executeQuery } from "@/lib/neo4j";
import { UpdateStoreInput, CreateIndustryInput } from "@/lib/types";
import { Transaction, ManagedTransaction } from "neo4j-driver";
import { setupStoreSubdomain } from "@/lib/subdomain-setup";
import { v4 as uuidv4 } from "uuid";

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

interface Store {
  metrics?: {
    sales: number;
    visitors: number;
    conversion: number;
  };
}

interface UpdateIndustryInput {
  name: string;
  description: string;
}

export const resolvers = {
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

      // Get the user ID from either source
      const userId = context.user?.id || context.session?.user?.id;
      
      if (!userId) {
        console.error("User ID missing in authenticated context");
        throw new Error("User ID required");
      }

      try {
        // First, check if the user exists
        const userCheck = await executeQuery(
          `MATCH (u:User {id: $userId}) RETURN u`,
          { userId }
        );
        
        if (userCheck.records.length === 0) {
          console.error(`User with ID ${userId} not found in Neo4j`);
          throw new Error("User not found");
        }
        
        // Try to find stores with OWNS relationship
        const result = await executeQuery(
          `MATCH (u:User {id: $userId})-[:OWNS]->(s:Store) RETURN s`,
          { userId }
        );
        
        // If no stores found with relationship, check for orphaned stores
        if (result.records.length === 0) {
          console.log(`No stores found with OWNS relationship for user ${userId}, checking for orphaned stores`);
          
          // Look for stores without any OWNS relationship
          const orphanedStores = await executeQuery(
            `MATCH (s:Store) 
             WHERE NOT (s)<-[:OWNS]-() 
             RETURN s`,
            {}
          );
          
          // If orphaned stores found, create relationships and return them
          if (orphanedStores.records.length > 0) {
            console.log(`Found ${orphanedStores.records.length} orphaned stores, creating relationships`);
            
            // Create OWNS relationships for all orphaned stores
            const fixResult = await executeQuery(
              `MATCH (u:User {id: $userId}), (s:Store)
               WHERE NOT (s)<-[:OWNS]-()
               CREATE (u)-[:OWNS]->(s)
               RETURN s`,
              { userId }
            );
            
            console.log(`Created ${fixResult.records.length} new OWNS relationships`);
            
            // Return the newly connected stores
            return fixResult.records.map((record: any) => {
              const store = record.get("s").properties;
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
          }
        }
        
        // Return stores with existing relationships
        return result.records.map((record: any) => {
          const store = record.get("s").properties;
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
        console.error("Stores query error:", error);
        throw new Error(
          `Failed to fetch stores: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
    store: async (
      _: unknown,
      { id }: { id: string },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (s:Store {id: $id, ownerId: $ownerId}) RETURN s`,
          { id, ownerId: context.session.user.id },
        );
        const store = result.records[0]?.get("s").properties;
        if (!store) throw new Error("Store not found");
        return store;
      } catch (error: unknown) {
        console.error("Error fetching store:", error);
        throw new Error(
          `Failed to fetch store: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    me: async (
      parent: unknown,
      args: unknown,
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        // First try to find the user by ID
        const result = await executeQuery(
          `MATCH (u:User {id: $id}) RETURN u { .id, .name, .email, .image } AS user`,
          { id: context.session.user.id },
        );

        let user = result.records[0]?.get("user");

        // If user not found by ID, try to find by email
        if (!user && context.session.user.email) {
          console.log(
            `User not found by ID, trying email: ${context.session.user.email}`,
          );
          const emailResult = await executeQuery(
            `MATCH (u:User {email: $email}) RETURN u { .id, .name, .email, .image } AS user`,
            { email: context.session.user.email },
          );

          user = emailResult.records[0]?.get("user");

          // If found by email but ID doesn't match, update the ID
          if (user && user.id !== context.session.user.id) {
            console.log(
              `Updating user ID from ${user.id} to ${context.session.user.id}`,
            );
            await executeQuery(
              `MATCH (u:User {email: $email}) SET u.id = $newId RETURN u`,
              {
                email: context.session.user.email,
                newId: context.session.user.id,
              },
            );
            user.id = context.session.user.id;
          }
        }

        // If user still not found, create a new user
        if (!user) {
          console.log(
            `User not found, creating new user: ${context.session.user.id}`,
          );
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
                email:
                  context.session.user.email ||
                  `user-${context.session.user.id}-${Date.now()}@example.com`,
                image: context.session.user.image || "",
              },
            );

            user = createResult.records[0]?.get("user");
          } catch (createError: unknown) {
            console.error(
              "Error creating user in GraphQL resolver:",
              createError,
            );

            // If creation fails due to uniqueness constraint, use a guaranteed unique email
            if (
              createError instanceof Error &&
              createError.message &&
              createError.message.includes("uniqueness constraint")
            ) {
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
                  image: context.session.user.image || "",
                },
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
        throw new Error(
          `Failed to get user: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    hello: () => "Hello from GraphQL!",
    industries: async (
      _: unknown,
      __: unknown,
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (c:Industry) RETURN c ORDER BY c.name`,
          {},
        );
        return result.records.map((record: any) => record.get("c").properties);
      } catch (error: unknown) {
        console.error("Error fetching industries:", error);
        throw new Error(
          `Failed to fetch industries: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    industry: async (
      _: unknown,
      { id }: { id: string },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (c:Industry {id: $id}) RETURN c`,
          { id },
        );
        const industry = result.records[0]?.get("c").properties;
        if (!industry) throw new Error("Industry not found");
        return industry;
      } catch (error: unknown) {
        console.error("Error fetching industry:", error);
        throw new Error(
          `Failed to fetch industry: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    products: async (
      _: unknown,
      { storeId }: { storeId: string },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (p:Product {storeId: $storeId})
           RETURN p ORDER BY p.createdAt DESC`,
          { storeId },
        );

        return result.records.map((record: any) => {
          const product = record.get("p").properties;
          return {
            ...product,
            createdAt: product.createdAt.toString(),
            updatedAt: product.updatedAt.toString(),
          };
        });
      } catch (error: unknown) {
        console.error("Error fetching products:", error);
        throw new Error(
          `Failed to fetch products: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    blogPosts: async (
      _: unknown,
      { storeId }: { storeId: string },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (b:BlogPost {storeId: $storeId})
           RETURN b ORDER BY b.createdAt DESC`,
          { storeId },
        );

        return result.records.map((record: any) => {
          const blogPost = record.get("b").properties;
          return {
            ...blogPost,
            createdAt: blogPost.createdAt.toString(),
            updatedAt: blogPost.updatedAt.toString(),
          };
        });
      } catch (error: unknown) {
        console.error("Error fetching blog posts:", error);
        throw new Error(
          `Failed to fetch blog posts: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    blogPost: async (
      _: unknown,
      { id }: { id: string },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (b:BlogPost {id: $id})
           RETURN b`,
          { id },
        );
        const blogPost = result.records[0]?.get("b").properties;
        if (!blogPost) throw new Error("Blog post not found");
        return {
          ...blogPost,
          createdAt: blogPost.createdAt.toString(),
          updatedAt: blogPost.updatedAt.toString(),
        };
      } catch (error: unknown) {
        console.error("Error fetching blog post:", error);
        throw new Error(
          `Failed to fetch blog post: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    storeBySubdomain: async (
      _: unknown,
      { subdomain }: { subdomain: string },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      try {
        const result = await executeQuery(
          `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
          { subdomain },
        );
        const store = result.records[0]?.get("s").properties;
        if (!store) throw new Error("Store not found");
        return store;
      } catch (error: unknown) {
        console.error("Error fetching store by subdomain:", error);
        throw new Error(
          `Failed to fetch store by subdomain: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  },
  Mutation: {
    createStore: async (
      _: any,
      { input }: { input: CreateStoreInput },
      context: { session: Session | null }
    ) => {
      try {
        // Check if user is authenticated
        if (!context.session) {
          throw new Error("Not authenticated");
        }

        console.log("Create store input:", input);
        console.log("Session:", context.session);

        // Check if user exists in Neo4j
        const userEmail = context.session.user?.email;
        if (!userEmail) {
          throw new Error("User email not found in session");
        }

        // Find user by email
        const userResult = await executeQuery(
          `
          MATCH (u:User {email: $email})
          RETURN u
          `,
          { email: userEmail }
        );

        let userId = userResult.records[0]?.get("u")?.properties?.id;

        // If user doesn't exist, create one
        if (!userId) {
          console.log("User not found, creating new user");
          userId = uuidv4();
          await executeQuery(
            `
            CREATE (u:User {
              id: $id,
              name: $name,
              email: $email,
              image: $image
            })
            RETURN u
            `,
            {
              id: userId,
              name: context.session.user?.name || "",
              email: userEmail,
              image: context.session.user?.image || "",
            }
          );
        }

        // Create store
        const storeId = uuidv4();
        const result = await executeQuery(
          `
          CREATE (s:Store {
            id: $id,
            name: $name,
            industry: $industry,
            subdomain: $subdomain,
            ownerId: $ownerId,
            createdAt: datetime(),
            updatedAt: datetime()
          })
          RETURN s
          `,
          {
            id: storeId,
            name: input.name,
            industry: input.industry,
            subdomain: input.subdomain,
            ownerId: userId,
          }
        );

        const store = result.records[0]?.get("s")?.properties;
        
        if (!store) {
          throw new Error("Failed to create store");
        }

        // Set up subdomain
        console.log("Setting up subdomain for store:", store);
        try {
          // Try to set up the subdomain, but don't fail the store creation if it fails
          await setupStoreSubdomain(store);
          console.log("Subdomain setup completed successfully");
        } catch (subdomainError) {
          // Log the error but continue with store creation
          console.error("Error setting up subdomain:", subdomainError);
          console.log("Store created successfully, but subdomain setup failed. User can set up subdomain manually later.");
        }

        return {
          ...store,
          createdAt: new Date(store.createdAt),
          updatedAt: new Date(store.updatedAt),
        };
      } catch (error) {
        console.error("Error creating store:", error);
        throw error;
      }
    },
    updateStore: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateStoreInput },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const setClauses = Object.keys(input)
          .map((key) => {
            if (key === "metrics") {
              return `s.metrics = ${JSON.stringify(input.metrics)}`;
            }
            return `s.${key} = $${key}`;
          })
          .join(", ");

        const result = await session.run(
          `MATCH (s:Store {id: $id, ownerId: $ownerId})
           SET ${setClauses}, s.updatedAt = datetime()
           RETURN s`,
          { id, ownerId: context.session.user.id, ...input },
        );
        const store = result.records[0]?.get("s").properties;
        if (!store) throw new Error("Store not found");
        return store;
      } finally {
        await session.close();
      }
    },
    deleteStore: async (
      _: unknown,
      { id }: { id: string },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (s:Store {id: $id, ownerId: $ownerId})
           DETACH DELETE s
           RETURN count(s) > 0 as deleted`,
          { id, ownerId: context.session.user.id },
        );
        return result.records[0].get("deleted");
      } finally {
        await session.close();
      }
    },
    updateUser: async (
      parent: unknown,
      { input }: { input: { name?: string; email?: string; image?: string } },
      context: { session?: { user: { id: string } } },
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
          },
        );
        const record = result.records[0];
        if (!record) throw new Error("User not found");
        return record.get("user");
      } finally {
        await session.close();
      }
    },
    deleteUser: async (
      parent: unknown,
      args: unknown,
      context: { session?: { user: { id: string } } },
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
            DETACH DELETE u
            RETURN count(u) AS deletedCount
          `,
          { id: userId },
        );
        const count = result.records[0].get("deletedCount").toNumber();
        return count > 0;
      } finally {
        await session.close();
      }
    },
    dummy: () => "dummy",
    createIndustry: async (
      _: unknown,
      { input }: { input: CreateIndustryInput },
      context: { session?: Session },
    ) => {
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
            ...input,
          },
        );
        return result.records[0].get("c").properties;
      } finally {
        await session.close();
      }
    },
    updateIndustry: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateIndustryInput },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const setClauses = Object.keys(input)
          .map((key) => `c.${key} = $${key}`)
          .join(", ");

        const result = await session.run(
          `MATCH (c:Industry {id: $id})
           SET ${setClauses}, c.updatedAt = datetime()
           RETURN c`,
          { id, ...input },
        );
        const industry = result.records[0]?.get("c").properties;
        if (!industry) throw new Error("Industry not found");
        return industry;
      } finally {
        await session.close();
      }
    },
    createProduct: async (
      _: unknown,
      { input }: { input: CreateProductInput },
      context: { session?: Session; user?: Record<string, unknown> },
    ) => {
      // Check authentication using the enhanced check we added to stores resolver
      if (!context.session && !context.user) {
        console.error("Authentication missing in createProduct resolver");
        throw new Error("Authentication required");
      }

      // Get the user ID from either source
      const userId = context.user?.id || context.session?.user?.id;

      if (!userId) {
        console.error("User ID missing in createProduct context");
        throw new Error("User ID required");
      }

      const session = driver.session();
      try {
        console.log("Creating product with input:", {
          ...input,
          userIdFromContext: userId,
        });

        // First verify that the user owns this store
        const storeCheck = await session.run(
          `MATCH (u:User {id: $userId})-[:OWNS]->(s:Store {id: $storeId}) RETURN s`,
          { userId, storeId: input.storeId },
        );

        if (storeCheck.records.length === 0) {
          throw new Error("Store not found or user doesn't have permission");
        }

        const result = await session.executeWrite((tx: ManagedTransaction) =>
          tx.run(
            `MATCH (s:Store {id: $storeId})
             CREATE (p:Product {
               id: apoc.create.uuid(),
               name: $name,
               description: $description,
               price: $price,
               sku: $sku,
               category: $category,
               storeId: $storeId,
               inventory: $inventory,
               status: $status,
               createdAt: datetime(),
               updatedAt: datetime()
             })
             CREATE (s)-[:HAS_PRODUCT]->(p)
             RETURN p`,
            {
              ...input,
              description: input.description || "",
              inventory: input.inventory || 0,
              status: input.status || "ACTIVE",
            },
          ),
        );

        // Add better error handling for empty results
        if (!result.records || result.records.length === 0) {
          console.error("No records returned from product creation query");
          throw new Error("Failed to create product - no result returned");
        }

        // Add null checks and debugging
        const record = result.records[0];
        console.log("Product creation record:", {
          hasP: record.has("p"),
          keys: record.keys,
          fieldTypes: record.get("p") ? typeof record.get("p") : "undefined",
        });

        if (!record.has("p") || !record.get("p")) {
          console.error("Missing 'p' in result record");
          throw new Error("Failed to create product - missing data in result");
        }

        // Safely access properties with optional chaining
        const product = record.get("p").properties;
        return {
          ...product,
          createdAt: product.createdAt?.toString() || new Date().toISOString(),
          updatedAt: product.updatedAt?.toString() || new Date().toISOString(),
        };
      } catch (error: unknown) {
        console.error("Error creating product:", error);
        throw error; // Throw the original error for better debugging
      } finally {
        await session.close();
      }
    },
    createBlogPost: async (
      _: unknown,
      { input }: { input: CreateBlogPostInput },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Authentication required");
      }

      const session = driver.session();
      try {
        const result = await session.executeWrite((tx: ManagedTransaction) =>
          tx.run(
            `MATCH (s:Store {id: $storeId})
             CREATE (b:BlogPost {
               id: apoc.create.uuid(),
               title: $title,
               content: $content,
               metaDescription: $metaDescription,
               tags: $tags,
               category: $category,
               storeId: $storeId,
               status: $status,
               createdAt: datetime(),
               updatedAt: datetime()
             })
             CREATE (s)-[:HAS_BLOG_POST]->(b)
             RETURN b`,
            {
              ...input,
              status: input.status || "DRAFT",
            },
          ),
        );

        const blogPost = result.records[0].get("b").properties;
        return {
          ...blogPost,
          createdAt: blogPost.createdAt.toString(),
          updatedAt: blogPost.updatedAt.toString(),
        };
      } catch (error: unknown) {
        console.error("Error creating blog post:", error);
        throw new Error("Failed to create blog post");
      } finally {
        await session.close();
      }
    },
    updateBlogPost: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateBlogPostInput },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const setClauses = Object.keys(input)
          .map((key) => `b.${key} = $${key}`)
          .join(", ");

        const result = await session.run(
          `MATCH (b:BlogPost {id: $id})
           SET ${setClauses}, b.updatedAt = datetime()
           RETURN b`,
          { id, ...input },
        );
        const blogPost = result.records[0]?.get("b").properties;
        if (!blogPost) throw new Error("Blog post not found");
        return {
          ...blogPost,
          createdAt: blogPost.createdAt.toString(),
          updatedAt: blogPost.updatedAt.toString(),
        };
      } finally {
        await session.close();
      }
    },
    deleteBlogPost: async (
      _: unknown,
      { id }: { id: string },
      context: { session?: Session },
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (b:BlogPost {id: $id})
           DETACH DELETE b
           RETURN count(b) > 0 as deleted`,
          { id },
        );
        return result.records[0].get("deleted");
      } finally {
        await session.close();
      }
    },
  },
};
