import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getSession } from "next-auth/react";
import { RetryLink } from "@apollo/client/link/retry";

// Create a function to get the Apollo Client
export function getApolloClient() {
  // Create the HTTP link with more detailed error handling
  const httpLink = new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
    fetchOptions: {
      mode: 'cors',
      credentials: 'include',
    }
  });

  // Create a terminating link to catch network errors
  const terminatingLink = new ApolloLink((operation, forward) => {
    return forward(operation).map(response => {
      // Log successful responses for debugging
      console.log(`GraphQL response for ${operation.operationName || 'unnamed operation'}:`, {
        hasData: !!response.data,
        hasErrors: !!response.errors,
        errorCount: response.errors?.length || 0
      });
      return response;
    });
  });

  // Create a retry link for specific errors
  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: 3000,
      jitter: true
    },
    attempts: {
      max: 5, // Increased from 3 to 5
      retryIf: (error, operation) => {
        // Log all errors for debugging
        console.log('Apollo retry link considering error:', {
          message: error?.message,
          name: error?.name,
          operation: operation.operationName,
          variables: operation.variables,
          hasResult: !!error.result,
          statusCode: error.statusCode
        });
        
        // Retry on network errors and 'User not found' errors
        const isNetworkError = !error.result || error.name === 'ServerError' || error.statusCode === 0;
        const isUserNotFoundError = error?.message?.includes('User not found');
        const isAuthError = error?.message?.includes('Not authenticated');
        const isCorsError = error?.message?.includes('CORS');
        
        if (isNetworkError) {
          console.log('Retrying GraphQL operation due to network error');
          return true;
        }
        
        if (isCorsError) {
          console.log('Retrying GraphQL operation due to CORS error');
          return true;
        }
        
        if (isUserNotFoundError) {
          console.log('Retrying GraphQL operation due to "User not found" error');
          // Trigger user sync before retry
          fetch('/api/user-sync', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }).catch(e => console.error('Error syncing user during retry:', e));
          return true;
        }
        
        if (isAuthError) {
          console.log('Retrying GraphQL operation due to authentication error');
          // Refresh the session before retry
          if (typeof window !== 'undefined') {
            // Only call getSession in the client context
            getSession().catch(e => console.error('Error refreshing session:', e));
          }
          return true;
        }
        
        return false;
      }
    }
  });

  // Create an error handling link
  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
        );
        
        // If we get a user not found error, try to sync the user
        if (message.includes('User not found')) {
          console.log('Detected "User not found" error, triggering user sync');
          fetch('/api/user-sync', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }).catch(e => console.error('Error syncing user:', e));
        }
        
        // If we get an authentication error, try to refresh the session
        if (message.includes('Not authenticated')) {
          console.log('Detected authentication error, refreshing session');
          if (typeof window !== 'undefined') {
            // Only call getSession in the client context
            getSession().catch(e => console.error('Error refreshing session:', e));
          }
        }
      });
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`, {
        name: networkError.name,
        message: networkError.message,
        stack: networkError.stack,
        operation: operation.operationName,
        statusCode: (networkError as { statusCode?: number }).statusCode,
        bodyText: (networkError as { bodyText?: string }).bodyText
      });
      
      // Try to refresh the session on network errors
      if (typeof window !== 'undefined') {
        getSession().then(session => {
          console.log('Refreshed session after network error:', {
            hasSession: !!session,
            userId: session?.user?.id || 'none'
          });
        }).catch(e => {
          console.error('Error refreshing session:', e);
        });
      }
      
      // For status code 0 errors (CORS/network issues), try a direct fetch to test connectivity
      if ((networkError as { statusCode?: number }).statusCode === 0) {
        console.log('Detected status code 0 error, testing direct fetch to API');
      }
    }
  });

  // Create the auth link
  const authLink = setContext(async (_, { headers }) => {
    try {
      // Get the session using next-auth
      const session = await getSession();
      
      // More detailed logging for debugging
      console.log("Apollo Client Auth:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id || 'none',
        hasAccessToken: !!session?.accessToken,
        tokenPrefix: session?.accessToken ? session.accessToken.substring(0, 5) + '...' : 'none'
      });
      
      // Return the headers with the auth token if it exists
      return {
        headers: {
          ...headers,
          authorization: session?.accessToken ? `Bearer ${session.accessToken}` : "",
          "x-session-id": session?.user?.id || "",
          "x-auth-token": session?.accessToken || "",
          // Add cache control headers to prevent caching
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
      };
    } catch (error) {
      console.error('Error in Apollo auth link:', error);
      // Return empty headers if there's an error
      return { headers };
    }
  });

  // Create the Apollo Client with the retry link
  return new ApolloClient({
    link: from([retryLink, errorLink, authLink, terminatingLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            me: {
              // Don't cache the me query
              merge: true,
            },
            stores: {
              // Merge function for stores to ensure proper updates
              merge(existing = [], incoming) {
                // Log store updates
                console.log('Apollo cache: Merging stores', {
                  existingCount: existing?.length || 0,
                  incomingCount: incoming?.length || 0
                });
                return incoming; // Always use latest store data
              },
            }
          }
        },
        Store: {
          // Ensure stores are identified by their id
          keyFields: ['id'],
          fields: {
            metrics: {
              // Merge metrics properly when updating
              merge(existing, incoming) {
                return incoming || existing;
              }
            }
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network', // Use cache but verify with network
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
      },
      query: {
        fetchPolicy: 'network-only', // Always fetch from network for queries
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    // Add better error handling
    connectToDevTools: true,
  });
}

// Export a singleton instance for client components
const client = getApolloClient();
export default client; 