import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Store } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, Settings } from 'lucide-react';
import { SetupSubdomainButton } from '@/components/setup-subdomain-button';
import { useState } from 'react';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const [showSubdomainSetup, setShowSubdomainSetup] = useState(false);
  
  // Format metrics for display
  const formatMetric = (value: number) => {
    return value.toLocaleString();
  };
  
  // Handle subdomain button click
  const handleSubdomainButtonClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link from being activated
    setShowSubdomainSetup(!showSubdomainSetup);
  };
  
  // Handle visit store click
  const handleVisitStoreClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link from being activated
    window.open(`https://${store.subdomain}.joelmbaka.site`, '_blank');
  };

  return (
    <Link href={`/dashboard/stores/${store.id}`} passHref>
      <Card className="h-full overflow-hidden transition-all hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{store.name}</CardTitle>
            <Badge variant="outline">{store.industry}</Badge>
          </div>
          <CardDescription>
            {store.subdomain && (
              <span className="text-sm text-muted-foreground">
                {store.subdomain}.joelmbaka.site
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Sales</span>
              <span className="text-xl font-bold">
                ${formatMetric(store.metrics?.sales || 0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Visitors</span>
              <span className="text-xl font-bold">
                {formatMetric(store.metrics?.visitors || 0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Conversion</span>
              <span className="text-xl font-bold">
                {(store.metrics?.conversion || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="ghost" size="sm" className="gap-1">
            <Settings className="h-4 w-4" />
            Dashboard
          </Button>
          
          {store.subdomain ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={handleVisitStoreClick}
            >
              <Globe className="h-4 w-4" />
              Visit Store
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={handleSubdomainButtonClick}
            >
              <Globe className="h-4 w-4" />
              Setup Subdomain
            </Button>
          )}
        </CardFooter>
        
        {showSubdomainSetup && (
          <div className="border-t p-4" onClick={(e) => e.preventDefault()}>
            <SetupSubdomainButton 
              store={store} 
              onSuccess={() => setShowSubdomainSetup(false)}
            />
          </div>
        )}
      </Card>
    </Link>
  );
} 