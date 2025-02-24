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
  const GET_STORE_BY_SUBDOMAIN = gql`
    query GetStoreBySubdomain($subdomain: String!) {
      storeBySubdomain(subdomain: $subdomain) {
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
  `;

  try {
    const { data } = await client.query({
      query: GET_STORE_BY_SUBDOMAIN,
      variables: { subdomain },
    });

    return data.storeBySubdomain;
  } catch (error) {
    console.error('Error fetching store by subdomain:', error);
    return null;
  }
} 