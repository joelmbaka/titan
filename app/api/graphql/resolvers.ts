import { Session } from "next-auth"
import { driver } from "@/lib/neo4j"
import { UpdateStoreInput, CreateIndustryInput } from "@/lib/types"

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
  title: string
  content: string
  metaDescription: string
  tags: string[]
  category: string
  storeId: string
  status?: string
}

interface UpdateBlogPostInput {
  title?: string
  content?: string
  metaDescription?: string
  tags?: string[]
  category?: string
  status?: string
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
    metrics: (store: Store) => store.metrics || {
      sales: 0,
      visitors: 0,
      conversion: 0
    },
  },
  Query: {
    stores: async (
      _: unknown,
      __: unknown,
      context: { session?: Session, user?: Record<string, unknown> }
    ) => {
      console.log("Stores resolver context:", {
        hasSession: !!context.session,
        hasUser: !!context.user,
        userId: context.user?.id || context.session?.user?.id || 'none',
        sessionInfo: context.session ? 'present' : 'missing'
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
      
      const session = driver.session();
      try {
        console.log("Executing Neo4j query with params:", { ownerId: userId });
        const result = await session.run(
          `MATCH (u:User {id: $ownerId})-[:OWNS]->(s:Store) RETURN s`,
          { ownerId: userId }
        );
        console.log('Neo4j query result:', {
          recordCount: result.records.length
        });
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
      } catch (error) {
        console.error('Stores query error:', error);
        throw error;
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
    },
    products: async (_: unknown, { storeId }: { storeId: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
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
      } finally {
        await session.close();
      }
    },
    blogPosts: async (_: unknown, { storeId }: { storeId: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (b:BlogPost {storeId: $storeId})
           RETURN b ORDER BY b.createdAt DESC`,
          { storeId }
        );

        return result.records.map(record => {
          const blogPost = record.get('b').properties;
          return {
            ...blogPost,
            createdAt: blogPost.createdAt.toString(),
            updatedAt: blogPost.updatedAt.toString()
          };
        });
      } finally {
        await session.close();
      }
    },
    blogPost: async (_: unknown, { id }: { id: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
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
      } finally {
        await session.close();
      }
    },
    storeBySubdomain: async (_: unknown, { subdomain }: { subdomain: string }, context: { session?: Session }) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
          { subdomain }
        );
        const store = result.records[0]?.get('s').properties;
        if (!store) throw new Error("Store not found");
        return store;
      } finally {
        await session.close();
      }
    },
  },
  Mutation: {
    createStore: async (
      _: unknown,
      { input }: { input: CreateStoreInput },
      context: { session?: Session }
    ) => {
      if (!context.session?.user) {
        console.error('Authentication failed - no session user');
        throw new Error("Not authenticated");
      }

      console.log('CreateStore Input:', input);
      console.log('User Session:', context.session?.user);
      console.log('User ID:', context.session.user.id);

      const session = driver.session();
      try {
        console.log('Executing Neo4j query...');
        const result = await session.run(
          `MATCH (u:User {id: $ownerId})
           CREATE (s:Store {
             id: apoc.create.uuid(),
             name: $name,
             industry: $industry,
             subdomain: $subdomain,
             createdAt: datetime(),
             updatedAt: datetime()
           })
           CREATE (u)-[:OWNS]->(s)
           RETURN s`,
          {
            ownerId: context.session.user.id,
            ...input
          }
        );

        console.log('Neo4j query result:', result.records[0]?.get('s').properties);
        const store = result.records[0]?.get('s').properties;
        return {
          ...store,
          metrics: { sales: 0, visitors: 0, conversion: 0 }, // Initialize metrics
          createdAt: store.createdAt.toString(),
          updatedAt: store.updatedAt.toString()
        };
      } catch (error: unknown) {
        console.error('Error creating store:', error);
        if (error instanceof Error) {
          throw new Error(`Failed to create store: ${error.message}`);
        } else {
          throw new Error('Failed to create store: Unknown error');
        }
      } finally {
        await session.close();
      }
    },
    updateStore: async (_: unknown, { id, input }: { id: string, input: UpdateStoreInput }, context: { session?: Session }) => {
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
    createIndustry: async (_: unknown, { input }: { input: CreateIndustryInput }, context: { session?: Session }) => {
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
    updateIndustry: async (_: unknown, { id, input }: { id: string, input: UpdateIndustryInput }, context: { session?: Session }) => {
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
    createProduct: async (
      _: unknown, 
      { input }: { input: CreateProductInput }, 
      context: { session?: Session, user?: Record<string, unknown> }
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
          userIdFromContext: userId
        });
        
        // First verify that the user owns this store
        const storeCheck = await session.run(
          `MATCH (u:User {id: $userId})-[:OWNS]->(s:Store {id: $storeId}) RETURN s`,
          { userId, storeId: input.storeId }
        );
        
        if (storeCheck.records.length === 0) {
          throw new Error("Store not found or user doesn't have permission");
        }
        
        const result = await session.executeWrite(tx =>
          tx.run(
            `MATCH (s:Store {id: $storeId})
             CREATE (p:Product {
               id: apoc.create.uuid(),
               name: $name,
               description: $description,
               price: $price,
               sku: $sku,
               category: $category,
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
              status: input.status || 'ACTIVE'
            }
          )
        );
        
        // Add better error handling for empty results
        if (!result.records || result.records.length === 0) {
          console.error("No records returned from product creation query");
          throw new Error("Failed to create product - no result returned");
        }
        
        // Add null checks and debugging
        const record = result.records[0];
        console.log("Product creation record:", {
          hasP: record.has('p'),
          keys: record.keys,
          fieldTypes: record.get('p') ? typeof record.get('p') : 'undefined'
        });
        
        if (!record.has('p') || !record.get('p')) {
          console.error("Missing 'p' in result record");
          throw new Error("Failed to create product - missing data in result");
        }
        
        // Safely access properties with optional chaining
        const product = record.get('p').properties;
        return {
          ...product,
          createdAt: product.createdAt?.toString() || new Date().toISOString(),
          updatedAt: product.updatedAt?.toString() || new Date().toISOString()
        };
      } catch (error) {
        console.error('Error creating product:', error);
        throw error; // Throw the original error for better debugging
      } finally {
        await session.close();
      }
    },
    createBlogPost: async (
      _: unknown, 
      { input }: { input: CreateBlogPostInput }, 
      context: { session?: Session }
    ) => {
      if (!context.session?.user) {
        throw new Error('Authentication required');
      }

      const session = driver.session();
      try {
        const result = await session.executeWrite(tx =>
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
              status: input.status || 'DRAFT'
            }
          )
        );

        const blogPost = result.records[0].get('b').properties;
        return {
          ...blogPost,
          createdAt: blogPost.createdAt.toString(),
          updatedAt: blogPost.updatedAt.toString()
        };
      } catch (error) {
        console.error('Error creating blog post:', error);
        throw new Error('Failed to create blog post');
      } finally {
        await session.close();
      }
    },
    updateBlogPost: async (
      _: unknown, 
      { id, input }: { id: string, input: UpdateBlogPostInput }, 
      context: { session?: Session }
    ) => {
      if (!context.session?.user) {
        throw new Error("Not authenticated");
      }

      const session = driver.session();
      try {
        const setClauses = Object.keys(input)
          .map(key => `b.${key} = $${key}`)
          .join(', ');

        const result = await session.run(
          `MATCH (b:BlogPost {id: $id})
           SET ${setClauses}, b.updatedAt = datetime()
           RETURN b`,
          { id, ...input }
        );
        const blogPost = result.records[0]?.get('b').properties;
        if (!blogPost) throw new Error("Blog post not found");
        return {
          ...blogPost,
          createdAt: blogPost.createdAt.toString(),
          updatedAt: blogPost.updatedAt.toString()
        };
      } finally {
        await session.close();
      }
    },
    deleteBlogPost: async (
      _: unknown, 
      { id }: { id: string }, 
      context: { session?: Session }
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
          { id }
        );
        return result.records[0].get('deleted');
      } finally {
        await session.close();
      }
    }
  },
};

