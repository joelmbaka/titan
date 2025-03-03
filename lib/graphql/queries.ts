import { gql } from "@apollo/client";

export const GET_STORES_QUERY = gql`
  query Stores {
    stores {
      id
      name
      industry
      subdomain
      owner {
        id
        name
        email
        image
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

export const GET_PRODUCTS_QUERY = gql`
  query GetProducts($storeId: ID!) {
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

export const GET_BLOG_POSTS_QUERY = gql`
  query BlogPosts($storeId: ID!) {
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
