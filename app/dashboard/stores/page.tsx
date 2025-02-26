"use client"

import { useQuery } from "@apollo/client";
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { StoreCard } from '@/components/store-card';
import { useState, useEffect } from 'react';
import { AddStoreModal } from '@/components/add-store-modal';
import { GET_STORES_QUERY } from '@/lib/graphql/queries';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Store } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/sign-in');
    }
  }, [status, router]);

  // Log session information for debugging
  useEffect(() => {
    console.log("Stores page session:", {
      status,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id || 'none',
      hasAccessToken: !!session?.accessToken
    });
  }, [session, status]);

  const { loading, error, data, refetch } = useQuery(GET_STORES_QUERY, {
    skip: status !== "authenticated" || !session?.user?.id,
    fetchPolicy: "cache-and-network", // Use cache but verify with network
    onError: (error) => {
      console.error("Stores query error details:", {
        message: error.message,
        networkError: error.networkError?.message,
        graphQLErrors: error.graphQLErrors?.map(e => e.message)
      });
    },
    context: {
      headers: {
        'x-debug-query': 'stores-query',
        'x-session-id': session?.user?.id || '',
        'x-auth-token': session?.accessToken || ''
      }
    },
    onCompleted: (data) => {
      console.log("Stores query completed:", {
        storeCount: data?.stores?.length || 0,
        stores: data?.stores?.map((s: Store) => ({ id: s.id, name: s.name })) || []
      });
    }
  });

  // Log when stores are successfully loaded
  useEffect(() => {
    if (data?.stores) {
      console.log(`Stores page: Successfully loaded ${data.stores.length} stores for user ${session?.user?.id}`);
    }
  }, [data?.stores, session?.user?.id]);

  if (status === "loading") {
    return <StoresPageSkeleton />;
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in the useEffect
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Stores</h1>
        </div>
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Error loading stores: {error.message}</AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const stores = data?.stores || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Stores</h1>
        <Button onClick={() => setShowAddStoreModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Store
        </Button>
      </div>

      {loading && !data ? (
        <StoresPageSkeleton />
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store: Store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">No stores found</p>
          <Button onClick={() => setShowAddStoreModal(true)}>
            Create Your First Store
          </Button>
        </div>
      )}

      <AddStoreModal
        open={showAddStoreModal}
        onClose={() => setShowAddStoreModal(false)}
        onStoreAdded={() => {
          refetch()
            .then(() => console.log("Stores refetched after new store added"))
            .catch(err => console.error("Error refetching stores:", err));
        }}
      />
    </div>
  );
}

function StoresPageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
      ))}
    </div>
  );
} 