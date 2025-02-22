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

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      sku
      category
      storeId
      createdAt
      updatedAt
      inventory
      status
    }
  }
`; 