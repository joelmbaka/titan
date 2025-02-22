import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/store/overview';
import { Analytics } from '@/components/store/analytics';
import { Settings } from '@/components/store/settings';

interface StoreTabsProps {
  storeId: string;
}

export function StoreTabs({ storeId }: StoreTabsProps) {
  return (
    <Tabs defaultValue="overview" className="flex-1">
      <TabsList className="px-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="p-6">
        <Overview storeId={storeId} />
      </TabsContent>
      <TabsContent value="analytics" className="p-6">
        <Analytics storeId={storeId} />
      </TabsContent>
      <TabsContent value="settings" className="p-6">
        <Settings storeId={storeId} />
      </TabsContent>
    </Tabs>
  );
} 