"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Badge } from "@/components/ui/badge";
import { 
  HELLO_QUERY, 
  ME_QUERY, 
  STORES_QUERY, 
  PRODUCTS_QUERY, 
  INDUSTRIES_QUERY,
  CREATE_STORE_MUTATION
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

export default function ResolversDebugPage() {
  const { data: session, status } = useSession();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; data?: any; error?: string }>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // GraphQL queries
  const [getHello, { loading: helloLoading }] = useLazyQuery(HELLO_QUERY, {
    onCompleted: (data) => {
      setTestResults(prev => ({
        ...prev,
        hello: { success: true, data }
      }));
    },
    onError: (error) => {
      setTestResults(prev => ({
        ...prev,
        hello: { success: false, error: error.message }
      }));
    }
  });

  const [getMe, { loading: meLoading }] = useLazyQuery(ME_QUERY, {
    onCompleted: (data) => {
      setTestResults(prev => ({
        ...prev,
        me: { success: true, data }
      }));
    },
    onError: (error) => {
      setTestResults(prev => ({
        ...prev,
        me: { success: false, error: error.message }
      }));
    }
  });

  const [getStores, { loading: storesLoading }] = useLazyQuery(STORES_QUERY, {
    onCompleted: (data) => {
      setTestResults(prev => ({
        ...prev,
        stores: { success: true, data }
      }));
      
      // Set the first store as selected if available
      if (data?.stores?.length > 0) {
        setSelectedStoreId(data.stores[0].id);
      }
    },
    onError: (error) => {
      setTestResults(prev => ({
        ...prev,
        stores: { success: false, error: error.message }
      }));
    }
  });

  const [getProducts, { loading: productsLoading }] = useLazyQuery(PRODUCTS_QUERY, {
    variables: { storeId: selectedStoreId || '' },
    skip: !selectedStoreId,
    onCompleted: (data) => {
      setTestResults(prev => ({
        ...prev,
        products: { success: true, data }
      }));
    },
    onError: (error) => {
      setTestResults(prev => ({
        ...prev,
        products: { success: false, error: error.message }
      }));
    }
  });

  const [getIndustries, { loading: industriesLoading }] = useLazyQuery(INDUSTRIES_QUERY, {
    onCompleted: (data) => {
      setTestResults(prev => ({
        ...prev,
        industries: { success: true, data }
      }));
    },
    onError: (error) => {
      setTestResults(prev => ({
        ...prev,
        industries: { success: false, error: error.message }
      }));
    }
  });

  const [createStore, { loading: createStoreLoading }] = useMutation(CREATE_STORE_MUTATION, {
    onCompleted: (data) => {
      setTestResults(prev => ({
        ...prev,
        createStore: { success: true, data }
      }));
      // Refresh stores list after creating a new store
      getStores();
    },
    onError: (error) => {
      setTestResults(prev => ({
        ...prev,
        createStore: { success: false, error: error.message }
      }));
    }
  });

  // Run all tests sequentially
  const runAllTests = async () => {
    try {
      setIsRunningTests(true);
      setTestResults({});
      
      // Run tests in sequence
      await getHello();
      await getMe();
      await getStores();
      await getIndustries();
      
      // Products query will be run automatically if a store is selected
    } catch (error: unknown) {
      console.error("Error running tests:", error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Create a test store
  const handleCreateTestStore = () => {
    const timestamp = Date.now();
    createStore({
      variables: {
        input: {
          name: `Test Store ${timestamp}`,
          industry: "Retail",
          subdomain: `test-store-${timestamp}`
        }
      }
    });
  };

  // Run products query when a store is selected
  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId);
    if (storeId) {
      getProducts({ variables: { storeId } });
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">GraphQL Resolvers Debug</h1>
      
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
          onClick={runAllTests}
          disabled={isRunningTests || status !== "authenticated"}
          className="w-1/2"
        >
          {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
        </Button>
        
        <Button 
          onClick={handleCreateTestStore}
          disabled={createStoreLoading || status !== "authenticated"}
          className="w-1/2"
        >
          {createStoreLoading ? 'Creating...' : 'Create Test Store'}
        </Button>
      </div>
      
      {/* Hello Query Test */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Hello Query</CardTitle>
            <StatusIndicator 
              isLoading={helloLoading}
              hasData={!!testResults.hello?.success}
              hasError={!!testResults.hello?.error}
            />
          </div>
          <CardDescription>Tests the basic hello resolver</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => getHello()}
            disabled={helloLoading}
            className="mb-4"
          >
            Test Hello Query
          </Button>
          
          {testResults.hello?.error && (
            <div className="text-red-500 mb-4">
              <p className="font-bold">Error:</p>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {testResults.hello.error}
              </pre>
            </div>
          )}
          
          {testResults.hello?.data && (
            <div>
              <p className="font-bold mb-2">Result:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(testResults.hello.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Me Query Test */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Me Query</CardTitle>
            <StatusIndicator 
              isLoading={meLoading}
              hasData={!!testResults.me?.success}
              hasError={!!testResults.me?.error}
            />
          </div>
          <CardDescription>Tests the current user resolver</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => getMe()}
            disabled={meLoading}
            className="mb-4"
          >
            Test Me Query
          </Button>
          
          {testResults.me?.error && (
            <div className="text-red-500 mb-4">
              <p className="font-bold">Error:</p>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {testResults.me.error}
              </pre>
            </div>
          )}
          
          {testResults.me?.data && (
            <div>
              <p className="font-bold mb-2">Result:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(testResults.me.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Stores Query Test */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Stores Query</CardTitle>
            <StatusIndicator 
              isLoading={storesLoading}
              hasData={!!testResults.stores?.success}
              hasError={!!testResults.stores?.error}
            />
          </div>
          <CardDescription>Tests the stores resolver</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => getStores()}
            disabled={storesLoading}
            className="mb-4"
          >
            Test Stores Query
          </Button>
          
          {testResults.stores?.error && (
            <div className="text-red-500 mb-4">
              <p className="font-bold">Error:</p>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {testResults.stores.error}
              </pre>
            </div>
          )}
          
          {testResults.stores?.data && (
            <div>
              <p className="font-bold mb-2">Result:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(testResults.stores.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Products Query Test */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Products Query</CardTitle>
            <StatusIndicator 
              isLoading={productsLoading}
              hasData={!!testResults.products?.success}
              hasError={!!testResults.products?.error}
            />
          </div>
          <CardDescription>Tests the products resolver for a specific store</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.stores?.data?.stores && testResults.stores.data.stores.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select a store:</label>
              <select 
                className="w-full p-2 border rounded"
                value={selectedStoreId || ''}
                onChange={(e) => handleStoreSelect(e.target.value)}
              >
                <option value="">Select a store</option>
                {testResults.stores.data.stores.map((store: any) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.subdomain})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <Button 
            onClick={() => selectedStoreId && getProducts({ variables: { storeId: selectedStoreId } })}
            disabled={productsLoading || !selectedStoreId}
            className="mb-4"
          >
            Test Products Query
          </Button>
          
          {testResults.products?.error && (
            <div className="text-red-500 mb-4">
              <p className="font-bold">Error:</p>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {testResults.products.error}
              </pre>
            </div>
          )}
          
          {testResults.products?.data && (
            <div>
              <p className="font-bold mb-2">Result:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(testResults.products.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Industries Query Test */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Industries Query</CardTitle>
            <StatusIndicator 
              isLoading={industriesLoading}
              hasData={!!testResults.industries?.success}
              hasError={!!testResults.industries?.error}
            />
          </div>
          <CardDescription>Tests the industries resolver</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => getIndustries()}
            disabled={industriesLoading}
            className="mb-4"
          >
            Test Industries Query
          </Button>
          
          {testResults.industries?.error && (
            <div className="text-red-500 mb-4">
              <p className="font-bold">Error:</p>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {testResults.industries.error}
              </pre>
            </div>
          )}
          
          {testResults.industries?.data && (
            <div>
              <p className="font-bold mb-2">Result:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(testResults.industries.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Store Test */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create Store Mutation</CardTitle>
            <StatusIndicator 
              isLoading={createStoreLoading}
              hasData={!!testResults.createStore?.success}
              hasError={!!testResults.createStore?.error}
            />
          </div>
          <CardDescription>Tests the createStore mutation</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCreateTestStore}
            disabled={createStoreLoading}
            className="mb-4"
          >
            Create Test Store
          </Button>
          
          {testResults.createStore?.error && (
            <div className="text-red-500 mb-4">
              <p className="font-bold">Error:</p>
              <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {testResults.createStore.error}
              </pre>
            </div>
          )}
          
          {testResults.createStore?.data && (
            <div>
              <p className="font-bold mb-2">Result:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(testResults.createStore.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 