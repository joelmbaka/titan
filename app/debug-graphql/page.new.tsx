"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useLazyQuery } from "@apollo/client";
import { Badge } from "@/components/ui/badge";
import { 
  HELLO_QUERY, 
  ME_QUERY, 
  STORES_QUERY, 
  PRODUCTS_QUERY, 
  INDUSTRIES_QUERY 
} from "@/app/api/graphql/client";

// Status indicator component
const StatusIndicator = ({ 
  isLoading, 
  hasData, 
  hasError 
}: { 
  isLoading: boolean; 
  hasData: boolean; 
  hasError: boolean;
}) => {
  if (isLoading) {
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Loading</Badge>;
  }
  if (hasError) {
    return <Badge variant="destructive">Error</Badge>;
  }
  if (hasData) {
    return <Badge variant="default" className="bg-green-600 hover:bg-green-600">Success</Badge>;
  }
  return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Not Run</Badge>;
};

export default function DebugGraphQLPage() {
  const { data: session, status } = useSession();
  const [neo4jStatus, setNeo4jStatus] = useState<any>(null);
  const [neo4jError, setNeo4jError] = useState<string | null>(null);
  const [graphqlApiStatus, setGraphqlApiStatus] = useState<any>(null);
  const [graphqlApiError, setGraphqlApiError] = useState<string | null>(null);
  const [directGraphqlStatus, setDirectGraphqlStatus] = useState<any>(null);
  const [directGraphqlError, setDirectGraphqlError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [helloResult, setHelloResult] = useState<any>(null);
  const [meResult, setMeResult] = useState<any>(null);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isHelloLoading, setIsHelloLoading] = useState(false);
  
  // GraphQL queries
  const [getHello, { loading: helloLoading, error: helloError, data: helloData }] = useLazyQuery(HELLO_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
  });
  const [getMe, { loading: meLoading, error: meError, data: meData }] = useLazyQuery(ME_QUERY, {
    fetchPolicy: 'cache-first',
  });
  const [getStores, { data: storesData, loading: storesLoading, error: storesError }] = useLazyQuery(STORES_QUERY);
  const [getProducts, { data: productsData, loading: productsLoading, error: productsError }] = useLazyQuery(PRODUCTS_QUERY, {
    variables: { storeId: selectedStoreId || '' }
  });
  const [getIndustries, { data: industriesData, loading: industriesLoading, error: industriesError }] = useLazyQuery(INDUSTRIES_QUERY);

  // Update selectedStoreId when stores data is loaded
  useEffect(() => {
    if (storesData?.stores?.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  // Update helloResult when helloData changes
  useEffect(() => {
    if (helloData) {
      setHelloResult(helloData);
    }
  }, [helloData]);

  // Update meResult when meData changes
  useEffect(() => {
    if (meData) {
      setMeResult(meData);
    }
  }, [meData]);

  // Test Neo4j connection
  const testNeo4j = async () => {
    try {
      const response = await fetch('/api/debug-neo4j');
      const data = await response.json();
      console.log("Neo4j connection test result:", data);
      return data;
    } catch (error) {
      console.error('Error testing Neo4j:', error);
      throw error;
    }
  };

  // Test GraphQL API endpoint
  const testGraphqlApi = async () => {
    try {
      setGraphqlApiError(null);
      const response = await fetch('/api/debug-graphql');
      const data = await response.json();
      setGraphqlApiStatus(data);
    } catch (error) {
      console.error('Error testing GraphQL API:', error);
      setGraphqlApiError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Test direct GraphQL endpoint
  const testDirectGraphql = async () => {
    try {
      setDirectGraphqlError(null);
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.accessToken ? `Bearer ${session.accessToken}` : '',
          'x-session-id': session?.user?.id || '',
          'x-auth-token': session?.accessToken || ''
        },
        body: JSON.stringify({
          query: `{ hello }`
        })
      });
      const data = await response.json();
      setDirectGraphqlStatus(data);
    } catch (error) {
      console.error('Error testing direct GraphQL:', error);
      setDirectGraphqlError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const fetchMe = async () => {
    try {
      const result = await getMe();
      if (result.data) {
        setMeResult(result.data);
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchAllData = async () => {
    try {
      setIsLoadingAll(true);
      // First fetch me to ensure user is synced
      await fetchMe();
      
      // Then fetch stores
      const storesResult = await getStores();
      
      // If stores are available, select the first one and fetch its products
      if (storesResult.data?.stores?.length > 0) {
        const firstStoreId = storesResult.data.stores[0].id;
        setSelectedStoreId(firstStoreId);
        
        // Fetch products for the selected store
        await getProducts({ 
          variables: { storeId: firstStoreId }
        });
      }
      
      // Also fetch industries
      await getIndustries();
      
    } catch (error: any) {
      console.error("Error fetching all data:", error);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const getHelloMessage = async () => {
    try {
      setIsHelloLoading(true);
      const result = await getHello();
      if (result.data) {
        setHelloResult(result.data);
      }
    } catch (error: any) {
      console.error("Error fetching hello message:", error);
    } finally {
      setIsHelloLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">GraphQL Debug</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Status: {status}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fetch All Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={fetchAllData}
            className="mb-4"
            disabled={isLoadingAll || meLoading || storesLoading || productsLoading}
          >
            {isLoadingAll ? 'Loading...' : meLoading || storesLoading || productsLoading ? 'Loading...' : 'Fetch All Data (Me → Stores → Products)'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Neo4j Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testNeo4j}
            className="mb-4"
          >
            Test Neo4j Connection
          </Button>
          
          {neo4jError && (
            <div className="text-red-500 mb-4">
              Error: {neo4jError}
            </div>
          )}
          
          {neo4jStatus && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(neo4jStatus, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>GraphQL API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testGraphqlApi}
            className="mb-4"
          >
            Test GraphQL API Endpoint
          </Button>
          
          {graphqlApiError && (
            <div className="text-red-500 mb-4">
              Error: {graphqlApiError}
            </div>
          )}
          
          {graphqlApiStatus && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(graphqlApiStatus, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Direct GraphQL Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testDirectGraphql}
            className="mb-4"
          >
            Test Direct GraphQL Query
          </Button>
          
          {directGraphqlError && (
            <div className="text-red-500 mb-4">
              Error: {directGraphqlError}
            </div>
          )}
          
          {directGraphqlStatus && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(directGraphqlStatus, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Test Hello Query</CardTitle>
          <CardDescription>Test the basic hello resolver</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={getHelloMessage}
              disabled={isHelloLoading}
            >
              {isHelloLoading ? "Loading..." : "Test Hello Query"}
            </Button>
            <StatusIndicator 
              isLoading={isHelloLoading}
              hasData={!!helloResult}
              hasError={!!helloError}
            />
          </div>
          
          {helloError && (
            <div className="text-red-500 mb-4">
              <p className="font-bold">Error:</p>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {helloError.message}
              </pre>
            </div>
          )}
          
          {helloResult && (
            <div>
              <p className="font-bold mb-2">Result:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(helloResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Fetch current user data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={fetchMe}
              disabled={meLoading}
            >
              {meLoading ? "Loading..." : "Fetch User Data"}
            </Button>
            <StatusIndicator 
              isLoading={meLoading}
              hasData={!!meResult}
              hasError={!!meError}
            />
          </div>
          
          {meError && (
            <div className="text-red-500 mb-4">
              <p className="font-bold">Error:</p>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {meError.message}
              </pre>
            </div>
          )}
          
          {meResult && (
            <div>
              <p className="font-bold mb-2">User Data:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(meResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>GraphQL Stores Query</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => getStores()}
            className="mb-4"
            disabled={storesLoading}
          >
            {storesLoading ? 'Loading...' : 'Run Stores Query'}
          </Button>
          
          {storesError && (
            <div className="text-red-500 mb-4">
              Error: {storesError.message}
            </div>
          )}
          
          {storesData && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(storesData, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>GraphQL Products Query</CardTitle>
        </CardHeader>
        <CardContent>
          {storesData?.stores && storesData.stores.length > 0 && (
            <div className="mb-4">
              <select 
                className="p-2 border rounded w-full mb-4"
                value={selectedStoreId || ''}
                onChange={(e) => setSelectedStoreId(e.target.value)}
              >
                <option value="">Select a store</option>
                {storesData.stores.map((store: any) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.subdomain})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <Button 
            onClick={() => selectedStoreId && getProducts({ variables: { storeId: selectedStoreId } })}
            className="mb-4"
            disabled={productsLoading || !selectedStoreId}
          >
            {productsLoading ? 'Loading...' : 'Run Products Query'}
          </Button>
          
          {productsError && (
            <div className="text-red-500 mb-4">
              Error: {productsError.message}
            </div>
          )}
          
          {productsData && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(productsData, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>GraphQL Industries Query</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => getIndustries()}
            className="mb-4"
            disabled={industriesLoading}
          >
            {industriesLoading ? 'Loading...' : 'Run Industries Query'}
          </Button>
          
          {industriesError && (
            <div className="text-red-500 mb-4">
              Error: {industriesError.message}
            </div>
          )}
          
          {industriesData && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(industriesData, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 