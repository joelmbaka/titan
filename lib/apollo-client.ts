import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "next-auth/react";

// Create a function to get the Apollo Client
export function getApolloClient() {
  const httpLink = createHttpLink({
    uri: "/api/graphql",
  });

  const authLink = setContext(async (_, { headers }) => {
    // Get the session using next-auth
    const session = await getSession();
    
    // Log the session for debugging (remove in production)
    console.log("Apollo Client Session:", session?.accessToken ? "Token exists" : "No token");
    
    // Return the headers with the auth token if it exists
    return {
      headers: {
        ...headers,
        authorization: session?.accessToken ? `Bearer ${session.accessToken}` : "",
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  });
}

// Export a singleton instance for client components
const client = getApolloClient();
export default client; 