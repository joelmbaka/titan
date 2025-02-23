import { Store } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface StoreHeaderProps {
  store: Store;
}

export function StoreHeader({ store }: StoreHeaderProps) {
  return (
    <div className="border-b p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-muted-foreground">{store.category || "No category"}</p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
} 