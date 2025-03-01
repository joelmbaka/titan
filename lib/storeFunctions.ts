import { Store, CreateStoreInput, UpdateStoreInput, CreateIndustryInput, UpdateIndustryInput, Industry } from '@/lib/types';
import { gql } from "@apollo/client";
import client from "@/lib/apollo-client";

// Store functions
export async function createStore(input: CreateStoreInput): Promise<Store> {
  const CREATE_STORE_MUTATION = gql`
    mutation CreateStore($input: CreateStoreInput!) {
      createStore(input: $input) {
        id
        name
        industry
        subdomain
        metrics {
          sales
          visitors
        }
      }
    }
  `;

  try {
    const { data, errors } = await client.mutate({
      mutation: CREATE_STORE_MUTATION,
      variables: { input },
    });

    if (errors) throw new Error(errors[0].message);
    return data.createStore;
  } catch (error) {
    console.error("Error creating store:", error);
    throw new Error("Failed to create store. Please try again.");
  }
}

export async function updateStore(id: string, input: UpdateStoreInput): Promise<Store> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation UpdateStore($id: ID!, $input: UpdateStoreInput!) {
          updateStore(id: $id, input: $input) {
            id
            name
            industry
            subdomain
            metrics {
              sales
              visitors
              conversion
            }
            createdAt
            updatedAt
          }
        }
      `,
      variables: { id, input }
    })
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data.updateStore;
}

export async function deleteStore(id: string): Promise<boolean> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation DeleteStore($id: ID!) {
          deleteStore(id: $id)
        }
      `,
      variables: { id }
    })
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data.deleteStore;
}

// Category functions
export async function createIndustry(input: CreateIndustryInput): Promise<Industry> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation CreateIndustry($input: CreateIndustryInput!) {
          createIndustry(input: $input) {
            id
            name
            description
            createdAt
            updatedAt
          }
        }
      `,
      variables: { input }
    })
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data.createIndustry;
}

export async function updateIndustry(id: string, input: UpdateIndustryInput): Promise<Industry> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation UpdateIndustry($id: ID!, $input: UpdateIndustryInput!) {
          updateIndustry(id: $id, input: $input) {
            id
            name
            description
            createdAt
            updatedAt
          }
        }
      `,
      variables: { id, input }
    })
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data.updateIndustry;
}

export async function deleteIndustry(id: string): Promise<boolean> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation DeleteIndustry($id: ID!) {
          deleteIndustry(id: $id)
        }
      `,
      variables: { id }
    })
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data.deleteIndustry;
}

export async function getStoreBySubdomain(subdomain: string): Promise<Store | null> {
  console.log('getStoreBySubdomain - Fetching store with subdomain:', subdomain);
  
  const GET_STORE_BY_SUBDOMAIN = gql`
    query GetStoreBySubdomain($subdomain: String!) {
      storeBySubdomain(subdomain: $subdomain) {
        id
        name
        subdomain
        industry
        owner {
          id
          name
          email
        }
        metrics {
          sales
          visitors
          conversion
        }
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const { data } = await client.query({
      query: GET_STORE_BY_SUBDOMAIN,
      variables: { subdomain },
    });

    console.log('getStoreBySubdomain - Store data received:', data.storeBySubdomain);
    
    // Format date fields to handle complex date objects
    if (data.storeBySubdomain) {
      const store = { ...data.storeBySubdomain };
      
      // Convert date objects to ISO strings if they're not already strings
      if (store.createdAt && typeof store.createdAt !== 'string') {
        try {
          // If it's a complex date object, try to convert it to a proper date
          if (store.createdAt.year && store.createdAt.month && store.createdAt.day) {
            const date = new Date(
              store.createdAt.year, 
              store.createdAt.month - 1, // JavaScript months are 0-indexed
              store.createdAt.day,
              store.createdAt.hour || 0,
              store.createdAt.minute || 0,
              store.createdAt.second || 0
            );
            store.createdAt = date.toISOString();
          }
        } catch (error) {
          console.error('Error formatting createdAt date:', error);
          store.createdAt = new Date().toISOString(); // Fallback to current date
        }
      }
      
      // Do the same for updatedAt
      if (store.updatedAt && typeof store.updatedAt !== 'string') {
        try {
          if (store.updatedAt.year && store.updatedAt.month && store.updatedAt.day) {
            const date = new Date(
              store.updatedAt.year, 
              store.updatedAt.month - 1,
              store.updatedAt.day,
              store.updatedAt.hour || 0,
              store.updatedAt.minute || 0,
              store.updatedAt.second || 0
            );
            store.updatedAt = date.toISOString();
          }
        } catch (error) {
          console.error('Error formatting updatedAt date:', error);
          store.updatedAt = new Date().toISOString(); // Fallback to current date
        }
      }
      
      return store;
    }
    
    return data.storeBySubdomain;
  } catch (error) {
    console.error('getStoreBySubdomain - Error:', error);
    return null;
  }
}

// Product functions
export async function getProductsByStoreId(storeId: string) {
  console.log('getProductsByStoreId - Fetching products for store:', storeId);
  
  const GET_PRODUCTS_BY_STORE_ID = gql`
    query GetProductsByStoreId($storeId: ID!) {
      products(storeId: $storeId) {
        id
        name
        description
        price
        sku
        category
        inventory
        status
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const { data } = await client.query({
      query: GET_PRODUCTS_BY_STORE_ID,
      variables: { storeId: storeId.toString() },
    });

    console.log('getProductsByStoreId - Products received:', data.products);
    return data.products;
  } catch (error) {
    console.error('getProductsByStoreId - Error:', error);
    return [];
  }
}

export async function getProductById(productId: string) {
  console.log('getProductById - Fetching product:', productId);
  
  const GET_PRODUCT_BY_ID = gql`
    query GetProductById($productId: ID!) {
      product(id: $productId) {
        id
        name
        description
        price
        sku
        category
        inventory
        status
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const { data } = await client.query({
      query: GET_PRODUCT_BY_ID,
      variables: { productId: productId.toString() },
    });

    console.log('getProductById - Product received:', data.product);
    return data.product;
  } catch (error) {
    console.error('getProductById - Error:', error);
    return null;
  }
}

// Blog functions
export async function getBlogPostsByStoreId(storeId: string) {
  console.log('getBlogPostsByStoreId - Fetching blog posts for store:', storeId);
  
  const GET_BLOG_POSTS_BY_STORE_ID = gql`
    query GetBlogPostsByStoreId($storeId: ID!) {
      blogPosts(storeId: $storeId) {
        id
        title
        content
        metaDescription
        tags
        category
        status
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const { data } = await client.query({
      query: GET_BLOG_POSTS_BY_STORE_ID,
      variables: { storeId: storeId.toString() },
    });

    console.log('getBlogPostsByStoreId - Blog posts received:', data.blogPosts);
    return data.blogPosts;
  } catch (error) {
    console.error('getBlogPostsByStoreId - Error:', error);
    return [];
  }
} 