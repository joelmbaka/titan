import { gql } from "@apollo/client";

export const GET_USER_STORES_QUERY = gql`
  query GetUserStores {
    stores {
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
    }
  }
`; 