"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function FixRelationshipsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const checkRelationships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/debug-relationships');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error checking relationships:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const syncUser = async () => {
    try {
      setSyncLoading(true);
      setSyncError(null);
      
      const response = await fetch('/api/user-sync');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setSyncResult(data);
      
      // After syncing, check relationships again
      await checkRelationships();
    } catch (err) {
      console.error('Error syncing user:', err);
      setSyncError(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncLoading(false);
    }
  };

  // Check relationships on page load
  useEffect(() => {
    if (status === "authenticated") {
      checkRelationships();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Fix Neo4j Relationships</h1>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Fix Neo4j Relationships</h1>
        <Card>
          <CardContent className="pt-6">
            <p>You need to be signed in to use this tool.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Fix Neo4j Relationships</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Status: {status}</CardTitle>
          <CardDescription>Current authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={checkRelationships}
          disabled={loading}
          className="w-1/2"
        >
          {loading ? 'Checking...' : 'Check Relationships'}
        </Button>
        
        <Button 
          onClick={syncUser}
          disabled={syncLoading}
          className="w-1/2"
        >
          {syncLoading ? 'Syncing...' : 'Sync User & Check'}
        </Button>
      </div>
      
      {error && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {syncError && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">User Sync Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{syncError}</p>
          </CardContent>
        </Card>
      )}
      
      {syncResult && (
        <Card>
          <CardHeader>
            <CardTitle>User Sync Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(syncResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p><strong>User ID:</strong> {result.userId}</p>
                <p><strong>User Exists:</strong> {result.userExists ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Store Relationships</CardTitle>
              <CardDescription>
                {result.relationships.length > 0 
                  ? `Found ${result.relationships.length} stores with OWNS relationship` 
                  : 'No stores with OWNS relationship found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.relationships.length > 0 ? (
                <div className="space-y-4">
                  {result.relationships.map((rel: any, index: number) => (
                    <div key={index} className="p-4 border rounded">
                      <p><strong>Store:</strong> {rel.storeName}</p>
                      <p><strong>ID:</strong> {rel.storeId}</p>
                      <div className="mt-1"><strong>Relationship:</strong> <Badge>{rel.relationshipType}</Badge></div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-yellow-500">No store relationships found.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Orphaned Stores</CardTitle>
              <CardDescription>
                {result.orphanedStores.length > 0 
                  ? `Found ${result.orphanedStores.length} stores without OWNS relationship` 
                  : 'No orphaned stores found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.orphanedStores.length > 0 ? (
                <div className="space-y-4">
                  {result.orphanedStores.map((store: any, index: number) => (
                    <div key={index} className="p-4 border rounded">
                      <p><strong>Store:</strong> {store.storeName}</p>
                      <p><strong>ID:</strong> {store.storeId}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-500">No orphaned stores found.</p>
              )}
            </CardContent>
          </Card>
          
          {result.fixedRelationships && result.fixedRelationships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fixed Relationships</CardTitle>
                <CardDescription>
                  Fixed {result.fixedRelationships.length} store relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.fixedRelationships.map((rel: any, index: number) => (
                    <div key={index} className="p-4 border rounded bg-green-50 dark:bg-green-900/20">
                      <p><strong>Store:</strong> {rel.storeName}</p>
                      <p><strong>ID:</strong> {rel.storeId}</p>
                      <div className="mt-1"><strong>Relationship:</strong> <Badge className="bg-green-600">{rel.relationshipType}</Badge></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Raw Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 