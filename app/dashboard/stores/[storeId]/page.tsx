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
      {/* Additional store-related data can be displayed here */}
    </div>
  );
}
