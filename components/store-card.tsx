import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Store } from '@/lib/types';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/dashboard/stores/${store.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>{store.name}</CardTitle>
          <CardDescription>{store.industry.replace(/_/g, ' ')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium">{store.metrics?.sales || 0}</p>
              <p className="text-muted-foreground">Sales</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{store.metrics.visitors}</p>
              <p className="text-muted-foreground">Visitors</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{store.metrics.conversion}%</p>
              <p className="text-muted-foreground">Conversion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 