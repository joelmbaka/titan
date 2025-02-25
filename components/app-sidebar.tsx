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
          <SidebarGroup className="mt-2 border-t pt-2">
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              <span className="font-medium">Store Performance</span>
            </div>
            <div className="px-4 py-2">
              <div className="space-y-1">
                <div className="flex justify-between hover:bg-accent p-1 rounded">
                  <Link 
                    href={`/dashboard/stores/${currentStore?.id}/revenue`} 
                    className="flex-1 flex justify-between"
                  >
                    <span className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Revenue
                    </span>
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
                    <span className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      Visitors
                    </span>
                    <span className="font-medium">
                      {currentStore?.metrics?.visitors || 0}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </SidebarGroup>

          {/* Products & Inventory */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">Products & Inventory</span>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/products`} className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5" />
                  <span>All Products</span>
                  <span className="ml-auto text-xs bg-muted px-2 py-1 rounded-full">
                    {currentStore?.metrics?.products || 0}
                  </span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/categories`} className="flex items-center gap-3">
                  <Tag className="h-5 w-5" />
                  <span>Categories</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/inventory`} className="flex items-center gap-3">
                  <Package className="h-5 w-5" />
                  <span>Inventory</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Orders & Fulfillment */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <span className="font-medium">Orders & Fulfillment</span>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/orders`} className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Orders</span>
                  <span className="ml-auto text-xs bg-muted px-2 py-1 rounded-full">
                    {currentStore?.metrics?.orders || 0}
                  </span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/shipping`} className="flex items-center gap-3">
                  <Truck className="h-5 w-5" />
                  <span>Shipping</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Customers */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              <span className="font-medium">Customers</span>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/customers`} className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Customer List</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/segments`} className="flex items-center gap-3">
                  <Heart className="h-5 w-5" />
                  <span>Segments</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Marketing */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              <span className="font-medium">Marketing</span>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/campaigns`} className="flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  <span>Campaigns</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/email`} className="flex items-center gap-3">
                  <Mail className="h-5 w-5" />
                  <span>Email Marketing</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/discounts`} className="flex items-center gap-3">
                  <Tag className="h-5 w-5" />
                  <span>Discounts</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Content */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Content</span>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/blog`} className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span>Blog</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/pages`} className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span>Pages</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Store Settings */}
          <SidebarGroup className="mt-2 border-t pt-2">
            <div className="w-full px-4 py-2 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Store Settings</span>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/settings/general`} className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>General</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/settings/appearance`} className="flex items-center gap-3">
                  <Palette className="h-5 w-5" />
                  <span>Appearance</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/dashboard/stores/${currentStore?.id}/settings/team`} className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Team Members</span>
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