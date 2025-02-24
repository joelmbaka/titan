"use client";

import { ApolloProvider } from "@apollo/client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getApolloClient } from "@/lib/apollo-client";

export default function ApolloProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [client, setClient] = useState(getApolloClient());

  useEffect(() => {
    // Reinitialize Apollo client when session changes
    if (status === "authenticated") {
      console.log("ApolloProvider - Session authenticated:", {
        hasUser: !!session?.user,
        userId: session?.user?.id || 'missing',
        hasToken: !!session?.accessToken
      });
      setClient(getApolloClient());
    }
  }, [session, status]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
} 