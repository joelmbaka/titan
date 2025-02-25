"use client";

import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreContext } from "@/context/store-context";
import { useQuery } from "@apollo/client";
import { GET_STORES_QUERY } from "@/lib/graphql/queries";
import { 
  BarChart, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  Clock, 
  ArrowRight,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentStore, setCurrentStore } = useContext(StoreContext);
  const [activeStore, setActiveStore] = useState(currentStore);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/sign-in');
    }
  }, [status, router]);

  const { loading, error, data, refetch } = useQuery(GET_STORES_QUERY, {
    skip: status !== "authenticated" || !session?.user?.id,
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data?.stores?.length && !currentStore) {
        setCurrentStore(data.stores[0]);
      }
    }
  });

  // Update active store when currentStore changes
  useEffect(() => {
    if (currentStore) {
      console.log("Current store changed:", currentStore.name);
      setActiveStore(currentStore);
      
      // Refetch data to ensure we have the latest metrics
      refetch().catch(err => {
        console.error("Error refetching stores after store change:", err);
      });
    }
  }, [currentStore, refetch]);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
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
  
  if (stores.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welcome to Your Dashboard</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Create your first store to begin</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You don&apos;t have any stores yet. Create your first store to start selling products.</p>
            <Button asChild>
              <Link href="/dashboard/stores/new">Create Your First Store</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use activeStore from state to ensure UI updates when store changes
  const store = activeStore || currentStore || stores[0];
  
  // Mock data for demonstration
  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', date: '2023-06-15', status: 'Completed', total: 129.99 },
    { id: 'ORD-002', customer: 'Jane Smith', date: '2023-06-14', status: 'Processing', total: 79.50 },
    { id: 'ORD-003', customer: 'Robert Johnson', date: '2023-06-13', status: 'Shipped', total: 249.99 },
    { id: 'ORD-004', customer: 'Emily Davis', date: '2023-06-12', status: 'Completed', total: 54.25 },
  ];

  const lowStockProducts = [
    { id: 'PRD-001', name: 'Premium T-Shirt', stock: 3, threshold: 5 },
    { id: 'PRD-002', name: 'Designer Jeans', stock: 2, threshold: 5 },
    { id: 'PRD-003', name: 'Leather Wallet', stock: 4, threshold: 10 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {session?.user?.name || 'there'}!</h1>
          <p className="text-muted-foreground">
            {store ? (
              <>Here&apos;s what&apos;s happening with <span className="font-medium">{store.name}</span> today.</>
            ) : (
              <>Here&apos;s what&apos;s happening with your store today.</>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/stores/${store.id}`}>
            View Store Dashboard
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">${(store?.metrics?.revenue || 0).toLocaleString()}</h3>
                <p className="text-xs text-green-500 mt-1">+12.5% from last month</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                <h3 className="text-2xl font-bold mt-1">{store?.metrics?.orders || 0}</h3>
                <p className="text-xs text-green-500 mt-1">+5.2% from last month</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <h3 className="text-2xl font-bold mt-1">{store?.metrics?.products || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Total active products</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visitors</p>
                <h3 className="text-2xl font-bold mt-1">{store?.metrics?.visitors || 0}</h3>
                <p className="text-xs text-green-500 mt-1">+18.7% from last month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer purchases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/stores/${store.id}/orders`} className="flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {order.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alert</CardTitle>
            <CardDescription>Products with low stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.stock} in stock</p>
                    <span className="text-xs text-red-500">
                      Below threshold ({product.threshold})
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/dashboard/stores/${store.id}/inventory`}>
                  Manage Inventory
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4" asChild>
              <Link href={`/dashboard/stores/${store.id}/products/new`}>
                <Package className="h-8 w-8 mb-2" />
                <span>Add Product</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4" asChild>
              <Link href={`/dashboard/stores/${store.id}/orders`}>
                <ShoppingBag className="h-8 w-8 mb-2" />
                <span>View Orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4" asChild>
              <Link href={`/dashboard/stores/${store.id}/customers`}>
                <Users className="h-8 w-8 mb-2" />
                <span>Customers</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4" asChild>
              <Link href={`/dashboard/stores/${store.id}/analytics`}>
                <BarChart className="h-8 w-8 mb-2" />
                <span>Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between mb-4 pb-3 border-b">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-16 mb-2" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between mb-4 pb-3 border-b">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
