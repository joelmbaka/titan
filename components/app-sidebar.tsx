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
  ChevronDown,
  LayoutDashboard,
  Megaphone,
  LineChart
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useState, useContext } from "react";
import { StoreContext } from "@/context/store-context";
import { stores } from "@/data/stores";
import { AddStoreModal } from "@/components/add-store-modal";
import { useMutation } from "@apollo/client";
import { CREATE_STORE_MUTATION } from "@/lib/graphql/mutations";

export function AppSidebar() {
  const { currentStore, setCurrentStore, addStore } = useContext(StoreContext);
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [createStore] = useMutation(CREATE_STORE_MUTATION);

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
                value={currentStore.id}
                onChange={(e) => {
                  if (e.target.value === "add-new") {
                    setShowAddStoreModal(true);
                  } else {
                    const store = stores.find(s => s.id === e.target.value);
                    if (store) setCurrentStore(store);
                  }
                }}
                className="w-full p-2 border rounded-md bg-background"
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.icon} {store.name}
                  </option>
                ))}
                <option value="add-new" className="text-primary font-medium">
                  + Add New Store
                </option>
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
                <div className="flex justify-between">
                  <span>Sales</span>
                  <span className="font-medium">{currentStore.metrics.sales}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visitors</span>
                  <span className="font-medium">{currentStore.metrics.visitors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion</span>
                  <span className="font-medium">{currentStore.metrics.conversion}%</span>
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
      />
    </>
  );
} 