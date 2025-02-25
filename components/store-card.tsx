import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Store } from '@/lib/types';
import { SetupSubdomainButton } from '@/components/setup-subdomain-button';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const [showSubdomainSetup, setShowSubdomainSetup] = useState(false);
  
  // Prevent the Link from activating when clicking on the subdomain setup button
  const handleSubdomainButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSubdomainSetup(!showSubdomainSetup);
  };
  
  // Prevent the Link from activating when clicking on the visit store button
  const handleVisitStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://${store.subdomain}.joelmbaka.site`, '_blank');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Link href={`/dashboard/stores/${store.id}`} className="block">
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
              <p className="font-medium">{store.metrics?.visitors || 0}</p>
              <p className="text-muted-foreground">Visitors</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{store.metrics?.conversion || 0}%</p>
              <p className="text-muted-foreground">Conversion</p>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSubdomainButtonClick}
          >
            {showSubdomainSetup ? 'Hide Subdomain Setup' : 'Subdomain Setup'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleVisitStoreClick}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Store
          </Button>
        </div>
        
        {showSubdomainSetup && (
          <SetupSubdomainButton 
            store={store} 
            onSuccess={() => setShowSubdomainSetup(false)}
          />
        )}
      </CardFooter>
    </Card>
  );
} 