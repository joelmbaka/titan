"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Settings, 
  Users, 
  Mail, 
  FileText, 
  LayoutDashboard,
  Megaphone,
  ShoppingBag,
  Package,
  CreditCard,
  Tag,
  Truck,
  UserCircle,
  Heart,
  Palette,
  Globe,
  HelpCircle,
  PieChart,
  Zap,
  Image
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

        <SidebarContent className="flex-1 overflow-y-auto">
          {/* Dashboard Overview */}
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" className="flex items-center gap-3">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Store Performance */}
          

          {/* Products & Inventory */}
         
          {/* Orders & Fulfillment */}
       

          {/* Customers *

          {/* Marketing *>
          
          

          {/* Products & Blog Posts */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <span className="font-medium">Products & Blog Posts</span>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/products`} className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Products</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/blog`} className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span>Blog Posts</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/help" className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5" />
                <span>Help & Support</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/profile" className="flex items-center gap-3">
                <UserCircle className="h-5 w-5" />
                <span>My Profile</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AddStoreModal
        open={showAddStoreModal}
        onClose={() => setShowAddStoreModal(false)}
        onStoreAdded={refetch}
      />
    </>
  );
} 