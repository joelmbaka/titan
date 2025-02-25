"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function UserSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const pathname = usePathname();

  // Only sync on protected routes
  const shouldSync = pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/profile');

  useEffect(() => {
    // Only sync if authenticated and not already synced or syncing
    if (status === "authenticated" && session?.user && shouldSync && !synced && !syncing) {
      const syncUser = async () => {
        try {
          setSyncing(true);
          setError(null);
          
          console.log("Syncing user with Neo4j...");
          const response = await fetch('/api/user-sync');
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to sync user');
          }
          
          const data = await response.json();
          console.log("User sync result:", data);
          
          if (data.success) {
            setSynced(true);
            setRetryCount(0); // Reset retry count on success
          } else {
            throw new Error(data.error || 'User sync returned false');
          }
        } catch (err) {
          console.error("Error syncing user:", err);
          setError(err instanceof Error ? err.message : 'Unknown error');
          
          // Retry logic - retry up to 3 times with exponential backoff
          if (retryCount < 3) {
            const nextRetry = retryCount + 1;
            const delay = Math.pow(2, nextRetry) * 1000; // 2s, 4s, 8s
            
            console.log(`Will retry user sync in ${delay}ms (attempt ${nextRetry})`);
            setRetryCount(nextRetry);
            
            setTimeout(() => {
              setSyncing(false); // Allow the sync to be triggered again
            }, delay);
          } else {
            console.error("Max retry attempts reached for user sync");
            // Even if we failed to sync, we'll set synced to true to avoid infinite retries
            setSynced(true);
          }
        } finally {
          if (retryCount >= 3) {
            setSynced(true); // Prevent further retries after max attempts
          }
          setSyncing(false);
        }
      };
      
      syncUser();
    }
  }, [session, status, synced, syncing, shouldSync, retryCount]);

  // If we're on a protected route and still trying to sync, show a loading indicator
  if (shouldSync && status === "authenticated" && !synced && (syncing || retryCount > 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Syncing your account data...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500">Retry attempt {retryCount} of 3</p>
          )}
          {error && (
            <p className="text-sm text-red-500 mt-2">Error: {error}</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 