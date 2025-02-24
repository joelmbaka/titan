'use client';

import { ThemeProvider } from "next-themes";
import { ApolloProvider } from "@apollo/client";
import client from "@/lib/apollo-client";
import { ReactNode, useEffect, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </ThemeProvider>
  );
}
