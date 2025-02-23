"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Settings, 
  Users, 
  Mail, 
  FileText, 
  BarChart,
  LayoutDashboard,
  Megaphone,
  LineChart
} from "lucide-react";
import Link from "next/link";
import { useState, useContext } from "react";
import { StoreContext } from "@/context/store-context";
import { AddStoreModal } from "@/components/add-store-modal";
import { useQuery } from "@apollo/client";
import { GET_STORES_QUERY } from "@/lib/graphql/queries";
import { useSession } from "next-auth/react";
import { Store } from "@/lib/types";

export function AppSidebar() {
  const { currentStore, setCurrentStore } = useContext(StoreContext);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const { data: session } = useSession();

  const { loading, error, data, refetch } = useQuery(GET_STORES_QUERY, {
    skip: !session?.user?.id,
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      console.log("Stores data received:", data);
      if (data?.stores?.length) {
        setCurrentStore(data.stores[0]);
      }
    },
    onError: (error) => {
      console.error("Error fetching stores:", error);
    }
  });

  if (loading) {
    return <div>Loading stores...</div>;
  }

  if (error) {
    return <div>Error loading stores: {error.message}</div>;
  }

  const stores = data?.stores || [];

  return (
    <>
      <Sidebar className="w-[250px] border-r bg-background sticky top-0 h-screen max-md:hidden">
        <SidebarHeader className="px-4 py-6">
          <div className="flex flex-col gap-4">
            <Link href="/" className="hover:opacity-75 transition-opacity">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                <span>Promoter AI</span>
              </h1>
            </Link>
            
            {/* Store Selector */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Current Store</label>
              <select
                value={currentStore?.id || ""}
                onChange={(e) => {
                  if (e.target.value === "add-new") {
                    setShowAddStoreModal(true);
                  } else {
                    setCurrentStore(stores.find((s: Store) => s.id === e.target.value));
                  }
                }}
                className="w-full p-2 border rounded-md bg-background"
              >
                {loading ? (
                  <option disabled>Loading stores...</option>
                ) : stores.length > 0 ? (
                  stores.map((store: Store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))
                ) : (
                  <option disabled>No stores found</option>
                )}
                <option value="add-new">+ Add New Store</option>
              </select>
            </div>
          </div>
        </SidebarHeader>

        {/* Store Metrics */}
        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarGroup>
            <div className="px-4 py-2">
              <h3 className="font-medium mb-2">Store Metrics</h3>
              <div className="space-y-1">
                <div className="flex justify-between hover:bg-accent p-1 rounded">
                  <Link 
                    href={`/dashboard/stores/${currentStore?.id}/products`} 
                    className="flex-1 flex justify-between"
                  >
                    Products
                    <span className="font-medium">
                      {currentStore?.metrics?.products || 0}
                    </span>
                  </Link>
                </div>
                <div className="flex justify-between hover:bg-accent p-1 rounded">
                  <Link 
                    href={`/dashboard/stores/${currentStore?.id}/orders`} 
                    className="flex-1 flex justify-between"
                  >
                    Orders
                    <span className="font-medium">
                      {currentStore?.metrics?.orders || 0}
                    </span>
                  </Link>
                </div>
                <div className="flex justify-between hover:bg-accent p-1 rounded">
                  <Link 
                    href={`/dashboard/stores/${currentStore?.id}/revenue`} 
                    className="flex-1 flex justify-between"
                  >
                    Revenue
                    <span className="font-medium">
                      ${(currentStore?.metrics?.revenue || 0).toLocaleString()}
                    </span>
                  </Link>
                </div>
                <div className="flex justify-between hover:bg-accent p-1 rounded">
                  <Link 
                    href={`/dashboard/stores/${currentStore?.id}/web-analytics`} 
                    className="flex-1 flex justify-between"
                  >
                    Web Analytics
                    <span className="font-medium">
                      {currentStore?.metrics?.visitors || 0}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </SidebarGroup>

          {/* Management Section */}
          <SidebarGroup>
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">Team Management</span>
            </div>
            
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="h-5 w-5" />
                  <span>AI Agents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Megaphone className="h-5 w-5" />
                  <span>Campaigns</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Content Section */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText className="h-5 w-5" />
                  <span>Content Hub</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Mail className="h-5 w-5" />
                  <span>Email Templates</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Analytics Section */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart className="h-5 w-5" />
                  <span>Campaign Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart className="h-5 w-5" />
                  <span>Sales Metrics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LineChart className="h-5 w-5" />
                  <span>Performance Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Blog Section */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/blog`} className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Blog
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="h-5 w-5" />
                <span>System Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      
      <AddStoreModal
        open={showAddStoreModal}
        onClose={() => setShowAddStoreModal(false)}
        onStoreAdded={async () => {
          await refetch();
          if (data?.stores?.length) {
            setCurrentStore(data.stores[data.stores.length - 1]);
          }
        }}
      />
    </>
  );
} 