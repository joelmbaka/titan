import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getSession } from "next-auth/react";
import { RetryLink } from "@apollo/client/link/retry";

// Create a function to get the Apollo Client
export function getApolloClient() {
  const httpLink = new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
  });

  const retryLink = new RetryLink({
    attempts: {
      max: 5,
      retryIf: (error, operation) => {
        // Example logic: retry on network errors or specific GraphQL errors
        return !!error && (error.networkError || (error.graphQLErrors && error.graphQLErrors.length > 0));
      }
    }
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    // Error handling logic...
  });

  const authLink = setContext(async (_, { headers }) => {
    const session = await getSession();
    return {
      headers: {
        ...headers,
        authorization: session?.accessToken ? `Bearer ${session.accessToken}` : "",
      }
    };
  });

  return new ApolloClient({
    link: from([retryLink, errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}

// Export a singleton instance for client components
const client = getApolloClient();
export default client;

export function setupApolloClient() {
  // Create Apollo Client with centralized error handling and auth
} 