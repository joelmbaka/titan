import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/store/overview';
import { Analytics } from '@/components/store/analytics';
import { Settings } from '@/components/store/settings';
import { useContext } from 'react';
import { StoreContext } from '@/context/store-context';

export function StoreTabs() {
  const { currentStore } = useContext(StoreContext);
  const storeId = currentStore?.id;

  return (
    <Tabs defaultValue="overview" className="flex-1">
      <TabsList className="px-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="p-6">
        {storeId && <Overview />}
      </TabsContent>
      <TabsContent value="analytics" className="p-6">
        {storeId && <Analytics />}
      </TabsContent>
      <TabsContent value="settings" className="p-6">
        {storeId && <Settings />}
      </TabsContent>
    </Tabs>
  );
} 