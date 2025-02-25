import { getStoreBySubdomain } from '@/lib/storeFunctions.server';
import { notFound } from 'next/navigation';

export default async function TestPage({ 
  params 
}: { 
  params: { subdomain: string } 
}) {
  console.log('TestPage - Rendering test page for subdomain:', params.subdomain);
  
  const store = await getStoreBySubdomain(params.subdomain);
  
  if (!store) {
    console.log('TestPage - Store not found');
    notFound();
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Store Information</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(store, null, 2)}
        </pre>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Request Information</h2>
        <ul className="space-y-2">
          <li><strong>Subdomain:</strong> {params.subdomain}</li>
          <li><strong>Store Name:</strong> {store.name}</li>
          <li><strong>Industry:</strong> {store.industry}</li>
        </ul>
      </div>
    </div>
  );
} 