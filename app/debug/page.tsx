"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderInfo {
  [key: string]: string | string[] | { error: string };
}

export default function DebugPage() {
  const { data: session, status, update } = useSession();
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo | null>(null);

  // Fetch headers to check what's being sent
  useEffect(() => {
    async function checkHeaders() {
      try {
        const response = await fetch('/api/debug-headers');
        const data = await response.json();
        setHeaderInfo(data);
      } catch (error: unknown) {
        console.error('Error fetching headers:', error);
        setHeaderInfo({ error: 'Failed to fetch headers' });
      }
    }
    
    checkHeaders();
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Debug Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/debug/resolvers">
          <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>GraphQL Resolvers Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Test all GraphQL resolvers and mutations with detailed error reporting</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/debug-graphql">
          <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>GraphQL API Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Test GraphQL API endpoints and connections</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/api/debug-neo4j">
          <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Neo4j Connection Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Test Neo4j database connection and queries</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/api/debug-headers">
          <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Request Headers Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View request headers and authentication information</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Status: {status}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button 
              onClick={() => update()}
              className="mb-4"
            >
              Refresh Session
            </Button>
          </div>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {headerInfo ? JSON.stringify(headerInfo, null, 2) : 'Loading...'}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 