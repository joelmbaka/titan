"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
      } catch (error) {
        console.error('Error fetching headers:', error);
        setHeaderInfo({ error: 'Failed to fetch headers' });
      }
    }
    
    checkHeaders();
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
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