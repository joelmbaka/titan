import { Session } from "next-auth";
import { executeQuery } from "@/api/graphql/neo4j";

interface Store {
  metrics?: {
    sales: number;
    visitors: number;
    conversion: number;
  };
}

export const storeResolvers = {
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
}; 