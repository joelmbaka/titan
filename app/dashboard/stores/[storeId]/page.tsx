import { getStoreBySubdomain } from '@/lib/storeFunctions';

export default async function StoreDashboardPage({ params }: { params: { storeId: string } }) {
  const { storeId } = params;
  console.log('StoreDashboardPage - Store ID:', storeId);

  // Fetch store data using the storeId
  const store = await getStoreBySubdomain(storeId);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{store.name} Dashboard</h1>
      <p>{store.description}</p>
      <div>
        <h2 className="text-2xl font-semibold mt-4">Store Website</h2>
        <a href={`https://${store.subdomain}.joelmbaka.site`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Visit Store</a>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mt-4">Revenue</h2>
        <p className="text-lg">Total Revenue: ${(store.metrics?.revenue || 0).toLocaleString()}</p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mt-4">Top Products</h2>
        <ul>
          {store.topProducts?.map(product => (
            <li key={product.id} className="mb-2">
              {product.name} - Sold: {product.sold}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mt-4">Web Traffic</h2>
        <p className="text-lg">Visitors: {store.metrics?.webTraffic || 0}</p>
      </div>
      {/* Additional store-related data can be displayed here */}
    </div>
  );
}
