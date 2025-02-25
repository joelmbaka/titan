import { getStoreBySubdomain } from '@/lib/storeFunctions.server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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
          <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Navigation</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/products" className="text-blue-600 hover:underline">
              Products
            </Link>
          </li>
          <li>
            <Link href="/api/check-subdomain-store" className="text-blue-600 hover:underline">
              API: Check Store
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
} 