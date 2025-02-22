import { gql } from "@apollo/client";

export const CREATE_STORE_MUTATION = gql`
  mutation CreateStore($input: CreateStoreInput!) {
    createStore(input: $input) {
      id
      name
      industry
      subdomain
      ownerId
      createdAt
      updatedAt
    }
  }
`; 