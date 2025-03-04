import { useContext } from 'react';
import { StoreContext } from '@/context/store-context';
import { useSession } from 'next-auth/react';

export default async function StoreDashboardPage() {
  const { data: session } = useSession();
  const { currentStore } = useContext(StoreContext);

  if (!session || !session.user) {
    return <div>Please log in to access your store dashboard.</div>;
  }

  if (!currentStore) {
    return <div>Store not found</div>;
  }

  console.log('StoreDashboardPage - Current Store:', currentStore);

  return (
    <div>
      <h1 className="text-3xl font-bold">{currentStore.name} Dashboard</h1>
      <p>{currentStore.description}</p>
      <div>
        <h2 className="text-2xl font-semibold mt-4">Store Website</h2>
        <a href={`https://${currentStore.subdomain}.joelmbaka.site`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Visit Store</a>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mt-4">Revenue</h2>
        <p className="text-lg">Total Revenue: ${(currentStore.metrics?.revenue || 0).toLocaleString()}</p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mt-4">Top Products</h2>
        <ul>
          {currentStore.topProducts?.map(product => (
            <li key={product.id} className="mb-2">
              {product.name} - Sold: {product.sold}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mt-4">Web Traffic</h2>
        <p className="text-lg">Visitors: {currentStore.metrics?.webTraffic || 0}</p>
      </div>
      {/* Additional store-related data can be displayed here */}
    </div>
  );
}
