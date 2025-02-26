import { getStoreBySubdomain } from "@/lib/storeFunctions.server";
import { headers, cookies } from "next/headers";

export default async function DebugPage({ 
  params 
}: { 
  params: { subdomain: string } 
}) {
  console.log('DebugPage - Rendering debug page for subdomain:', params.subdomain);
  
  const store = await getStoreBySubdomain(params.subdomain);
  const headersList = headers();
  const cookiesList = cookies();
  
  // Get all headers for debugging
  const allHeaders: Record<string, string> = {};
  headersList.forEach((value, key) => {
    allHeaders[key] = value;
  });
  
  // Get all cookies for debugging
  const allCookies: Record<string, string> = {};
  cookiesList.getAll().forEach(cookie => {
    allCookies[cookie.name] = cookie.value;
  });
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Subdomain Debug Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Request Information</h2>
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p><strong>Subdomain Parameter:</strong> {params.subdomain}</p>
          <p><strong>Middleware Subdomain:</strong> {headersList.get('x-middleware-subdomain') || 'Not set'}</p>
          <p><strong>Middleware Rewrite:</strong> {headersList.get('x-middleware-rewrite') || 'Not set'}</p>
          <p><strong>Subdomain Cookie:</strong> {cookiesList.get('subdomain')?.value || 'Not set'}</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Store Information</h2>
        {store ? (
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p><strong>Store Found:</strong> Yes</p>
            <p><strong>Store ID:</strong> {store.id}</p>
            <p><strong>Store Name:</strong> {store.name}</p>
            <p><strong>Industry:</strong> {store.industry}</p>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <p><strong>Store Found:</strong> No</p>
            <p>No store was found with the subdomain: {params.subdomain}</p>
          </div>
        )}
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Headers</h2>
        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
          <pre className="text-xs">{JSON.stringify(allHeaders, null, 2)}</pre>
        </div>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Cookies</h2>
        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
          <pre className="text-xs">{JSON.stringify(allCookies, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
} 