"use client"; // Mark this as a Client Component
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gql } from "@apollo/client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Pencil, RefreshCw, AlertCircle } from "lucide-react"; // Import icons
import { useSession } from "next-auth/react"; // Import useSession
import Image from 'next/image';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Define the GraphQL mutation for updating the user
const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      image
    }
  }
`;

// Define the GraphQL query for fetching the user
const GET_USER_QUERY = gql`
  query GetUser {
    me {
      id
      name
      email
      image
    }
  }
`;

export default function Profile() {
  const { data: session, status: sessionStatus } = useSession();
  const { data, loading, error, refetch, networkStatus, client } = useQuery(GET_USER_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only', // Don't use cache for this query
    errorPolicy: 'all', // Continue even if there are errors
    onError: (error) => {
      console.error("GraphQL error fetching user:", error);
    }
  });
  
  const [updateUser, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER_MUTATION);
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [manualRetryCount, setManualRetryCount] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(0);

  // Enhanced sync user with Neo4j
  const syncUser = useCallback(async () => {
    try {
      setSyncLoading(true);
      setSyncError(null);
      
      console.log('Syncing user data...');
      
      const response = await fetch('/api/user-sync', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const result = await response.json();
      console.log('User sync result:', result);
      setSyncResult(result);
      
      // Clear Apollo cache to ensure fresh data
      await client.clearStore();
      
      // Refetch user data after sync with network-only policy
      await refetch();
      
      return result;
    } catch (err) {
      console.error('Error syncing user:', err);
      setSyncError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSyncLoading(false);
    }
  }, [setSyncLoading, setSyncError, refetch, client]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    try {
      await updateUser({
        variables: {
          input: { 
            name,
            email,
            image: data?.me?.image  // Preserve existing image
          },
        },
      });
      await refetch(); // Refetch the user data to display the updated name
      if (formRef.current) {
        formRef.current.reset(); // Clear the form
      }
      setIsEditing(false); // Hide the form after successful update
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // Manual retry function with exponential backoff
  const manualRetry = async () => {
    try {
      setManualRetryCount(prev => prev + 1);
      setLastRetryTime(Date.now());
      
      console.log(`Manual retry attempt ${manualRetryCount + 1}`);
      
      // Clear Apollo cache to ensure fresh data
      await client.clearStore();
      
      // Refetch with network-only policy
      await refetch({ fetchPolicy: 'network-only' });
    } catch (err) {
      console.error('Manual retry failed:', err);
    }
  };

  // Auto-retry if we have a session but no data
  useEffect(() => {
    if (sessionStatus === "authenticated" && !data && !loading && retryCount < 3) {
      // Calculate backoff time (exponential with jitter)
      const baseDelay = 1000 * Math.pow(2, retryCount);
      const jitter = Math.random() * 500;
      const delay = baseDelay + jitter;
      
      console.log(`Scheduling auto-retry ${retryCount + 1} in ${delay}ms`);
      
      const timer = setTimeout(() => {
        console.log(`Executing auto-retry ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        
        // Clear cache before retry
        client.clearStore().then(() => {
          refetch({ fetchPolicy: 'network-only' });
        }).catch(err => {
          console.error('Error clearing cache during retry:', err);
        });
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [sessionStatus, data, loading, retryCount, refetch, client]);

  // Sync user when authenticated but no data after retries
  useEffect(() => {
    if (sessionStatus === "authenticated" && !data && !loading && retryCount >= 3 && !syncLoading) {
      console.log("No user data after auto-retries, triggering user sync");
      syncUser().catch(err => {
        console.error('Auto sync after retries failed:', err);
      });
    }
  }, [sessionStatus, data, loading, retryCount, syncLoading, syncUser]);

  // Debug network status
  useEffect(() => {
    const statusMap: Record<number, string> = {
      1: 'loading',
      2: 'setVariables',
      3: 'fetchMore',
      4: 'refetch',
      6: 'poll',
      7: 'ready',
      8: 'error'
    };
    
    const statusName = statusMap[networkStatus] || `unknown(${networkStatus})`;
    
    if (networkStatus !== NetworkStatus.ready && networkStatus !== NetworkStatus.loading) {
      console.log(`GraphQL network status changed: ${networkStatus} (${statusName})`);
    }
  }, [networkStatus]);

  if (sessionStatus === "loading" || (sessionStatus === "authenticated" && loading && !data)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        {networkStatus !== NetworkStatus.loading && networkStatus !== NetworkStatus.ready && (
          <p className="mt-2 text-sm text-muted-foreground">
            Network status: {networkStatus} {retryCount > 0 ? `(Retry ${retryCount}/3)` : ''}
          </p>
        )}
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be signed in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const user = data?.me;
  const hasError = !!error || !user;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Profile</h1>
      
      {hasError && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>
            {error ? `Error: ${error.message}` : 'Unable to load user data'}
            <div className="mt-2 flex space-x-2">
              <Button 
                size="sm" 
                onClick={manualRetry} 
                disabled={Date.now() - lastRetryTime < 1000}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button 
                size="sm" 
                onClick={syncUser} 
                disabled={syncLoading}
              >
                {syncLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Sync User
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {user?.image ? (
        <Image
          src={user.image}
          alt="Profile Avatar"
                  className="rounded-full"
                  width={150}
                  height={150}
                />
              ) : (
                <div className="w-[150px] h-[150px] rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">
                    {user?.name?.charAt(0) || session?.user?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <Badge className="mb-2">{sessionStatus}</Badge>
                <p className="text-sm text-muted-foreground">
                  User ID: {user?.id || session?.user?.id || 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 space-y-2">
            <Button 
              onClick={syncUser} 
              disabled={syncLoading} 
              className="w-full"
              variant="outline"
            >
              {syncLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync User Data
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setShowDebug(!showDebug)} 
              className="w-full"
              variant="outline"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
        </Button>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Your personal information from your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form ref={formRef} onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Name
                      </label>
          <Input
                        id="name"
            name="name"
                        defaultValue={user.name || ""}
                        required
          />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
          <Input
                        id="email"
                        name="email"
            type="email"
                        defaultValue={user.email || ""}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
              Cancel
            </Button>
                      <Button type="submit" disabled={updateLoading}>
                        {updateLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
                    {updateError && (
                      <p className="text-red-500 text-sm mt-2">
                        Error: {updateError.message}
                      </p>
                    )}
        </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Name</h3>
                      <p className="mt-1">{user.name || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Email</h3>
                      <p className="mt-1">{user.email || "Not provided"}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Unable to load user information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    {error ? `Error: ${error.message}` : 'No user data available'}
                  </p>
                  <Button 
                    onClick={manualRetry} 
                    className="mt-4"
                    disabled={Date.now() - lastRetryTime < 1000}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {syncError && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sync Error</AlertTitle>
              <AlertDescription>{syncError}</AlertDescription>
            </Alert>
          )}
          
          {syncResult && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Sync Result</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(syncResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {showDebug && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Session Status: {sessionStatus}</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs mt-2">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">GraphQL User Data:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs mt-2">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">Query Status:</h3>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Network Status: {networkStatus}</p>
                <p>Auto Retry Count: {retryCount}</p>
                <p>Manual Retry Count: {manualRetryCount}</p>
                <p>Error: {error ? 'Yes' : 'No'}</p>
                {error && (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs mt-2">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
