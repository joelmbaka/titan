"use client"

import { useQuery } from "@apollo/client";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StoreCard } from '@/components/store-card';
import { useState, useEffect } from 'react';
import { AddStoreModal } from '@/components/add-store-modal';
import { GET_STORES_QUERY } from '@/lib/graphql/queries';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Store } from "@/lib/types";

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
      console.log("Stores query completed:", data);
    }
  });

  if (status === "loading") {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Stores</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in the useEffect
  }

  if (error) return <div className="p-6 text-red-500">Error loading stores: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Stores</h1>
        <Button onClick={() => setShowAddStoreModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Store
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
          ))}
        </div>
      ) : data?.stores?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.stores.map((store: Store) => (
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
        onStoreAdded={refetch}
      />
    </div>
  );
} 