import { gql } from "@apollo/client";

// Queries
export const HELLO_QUERY = gql`
  query Hello {
    hello
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      image
    }
  }
`;

export const STORES_QUERY = gql`
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
      createdAt
      metrics {
        sales
        visitors
        conversion
      }
    }
  }
`;

export const PRODUCTS_QUERY = gql`
  query Products($storeId: ID!) {
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
    }
  }
`;

export const INDUSTRIES_QUERY = gql`
  query Industries {
    industries {
      id
      name
      description
    }
  }
`;

export const STORE_QUERY = gql`
  query Store($id: ID!) {
    store(id: $id) {
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

export const STORE_BY_SUBDOMAIN_QUERY = gql`
  query StoreBySubdomain($subdomain: String!) {
    storeBySubdomain(subdomain: $subdomain) {
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

export const BLOG_POSTS_QUERY = gql`
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

export const BLOG_POST_QUERY = gql`
  query BlogPost($id: ID!) {
    blogPost(id: $id) {
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

// Mutations
export const CREATE_STORE_MUTATION = gql`
  mutation CreateStore($input: CreateStoreInput!) {
    createStore(input: $input) {
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
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_STORE_MUTATION = gql`
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
`;

export const DELETE_STORE_MUTATION = gql`
  mutation DeleteStore($id: ID!) {
    deleteStore(id: $id)
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
      inventory
      status
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_BLOG_POST_MUTATION = gql`
  mutation CreateBlogPost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) {
      id
      title
      content
      metaDescription
      tags
      category
      storeId
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BLOG_POST_MUTATION = gql`
  mutation UpdateBlogPost($id: ID!, $input: UpdateBlogPostInput!) {
    updateBlogPost(id: $id, input: $input) {
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

export const DELETE_BLOG_POST_MUTATION = gql`
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id)
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      image
    }
  }
`; 