"use client";

import { ApolloProvider } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { getApolloClient } from "@/lib/apollo-client";

export default function ApolloProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [client, setClient] = useState(getApolloClient());
  const prevStatusRef = useRef(status);
  const prevUserIdRef = useRef(session?.user?.id);
  const syncAttemptRef = useRef(0);

  // Update Apollo client when session changes
  useEffect(() => {
    const statusChanged = prevStatusRef.current !== status;
    const userIdChanged = prevUserIdRef.current !== session?.user?.id;
    
    console.log("ApolloProvider - Session check:", {
      status,
      prevStatus: prevStatusRef.current,
      hasUser: !!session?.user,
      userId: session?.user?.id || 'missing',
      prevUserId: prevUserIdRef.current || 'missing',
      hasToken: !!session?.accessToken,
      statusChanged,
      userIdChanged,
    });
    
    // Update refs
    prevStatusRef.current = status;
    prevUserIdRef.current = session?.user?.id;
    
    // Only recreate client if session status or user ID changed
    if (statusChanged || userIdChanged) {
      console.log("ApolloProvider - Session changed, recreating client");
      
      // Always create a new client when session changes to ensure fresh authentication
      const newClient = getApolloClient();
      setClient(newClient);
      
      // Clear cache when session changes
      newClient.clearStore().catch(e => {
        console.error('Error clearing Apollo cache:', e);
      });
      
      // Reset sync attempt counter
      syncAttemptRef.current = 0;
    }
    
    // If authenticated, trigger user sync
    if (status === 'authenticated' && session?.user?.id) {
      // Limit sync attempts to prevent infinite loops
      if (syncAttemptRef.current < 3) {
        console.log(`Authenticated session detected, syncing user data (attempt ${syncAttemptRef.current + 1})`);
        syncAttemptRef.current += 1;
        
        fetch('/api/user-sync', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return response.json();
        }).then(data => {
          console.log('User sync successful:', data);
          // Reset counter on success
          syncAttemptRef.current = 0;
        }).catch(e => {
          console.error('Error syncing user from Apollo Provider:', e);
        });
      }
    } else if (status === 'unauthenticated') {
      // Reset sync attempt counter when unauthenticated
      syncAttemptRef.current = 0;
    }
  }, [status, session]);

  // Debug client changes
  useEffect(() => {
    console.log("Apollo client instance changed");
    
    // Test connectivity when client changes
    fetch('/api/debug-graphql')
      .then(response => response.json())
      .then(data => {
        console.log('Debug API connectivity test:', data);
      })
      .catch(e => {
        console.error('Error testing API connectivity:', e);
      });
  }, [client]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
} 