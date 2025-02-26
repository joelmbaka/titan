import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/storeFunctions.server";
import Link from "next/link";
import { headers } from "next/headers";

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { subdomain: string } 
}): Promise<Metadata> {
  try {
    const store = await getStoreBySubdomain(params.subdomain);
    
    if (!store) {
      return {
        title: "Store Not Found",
        description: "The requested store could not be found."
      };
    }
    
    return {
      title: `${store.name} | Powered by Titan`,
      description: `Welcome to ${store.name}, your destination for quality products.`,
      openGraph: {
        title: store.name,
        description: `Welcome to ${store.name}, your destination for quality products.`,
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Store Error",
      description: "There was an error loading the store."
    };
  }
}

export default async function StorePage({ 
  params 
}: { 
  params: { subdomain: string } 
}) {
  console.log('StorePage - Rendering page for subdomain:', params.subdomain);
  
  try {
    const store = await getStoreBySubdomain(params.subdomain);
    console.log('StorePage - Store data:', store);
    
    if (!store) {
      console.log('StorePage - Store not found');
      notFound();
    }
    
    const headersList = headers();
    
    // Get middleware headers for debugging
    const middlewareSubdomain = headersList.get('x-middleware-subdomain');
    const middlewareRewrite = headersList.get('x-middleware-rewrite');
    
    // Increment visitor count (you can implement this later)
    // await incrementVisitorCount(store.id);
    
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Subdomain:</strong> {params.subdomain}</p>
              <p><strong>Middleware Subdomain:</strong> {middlewareSubdomain || 'Not set'}</p>
              <p><strong>Middleware Rewrite:</strong> {middlewareRewrite || 'Not set'}</p>
              <p><strong>Store ID:</strong> {store.id}</p>
              <p><strong>Store Name:</strong> {store.name}</p>
              <p><strong>Industry:</strong> {store.industry}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Navigation Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/test" className="text-blue-600 hover:underline">
                  Test Page
                </Link>
              </li>
              <li>
                <Link href="/debug" className="text-blue-600 hover:underline">
                  Debug Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-blue-600 hover:underline">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/api/health-check" className="text-blue-600 hover:underline">
                  API: Health Check
                </Link>
              </li>
              <li>
                <Link href="/api/subdomain-test" className="text-blue-600 hover:underline">
                  API: Subdomain Test
                </Link>
              </li>
            </ul>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                    <h3 className="font-semibold">Product Name</h3>
                    <p className="text-gray-600 text-sm mb-2">Product description goes here</p>
                    <p className="font-bold">$99.99</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                    <h3 className="font-semibold">Product Name</h3>
                    <p className="text-gray-600 text-sm mb-2">Product description goes here</p>
                    <p className="font-bold">$99.99</p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-bold mb-4">About Us</h2>
                <p className="text-gray-700 mb-4">
                  Welcome to {store.name}! We're dedicated to providing the best products and services to our customers.
                </p>
                <p className="text-gray-700">
                  Our store specializes in {store.industry} products, carefully selected for quality and value.
                </p>
              </section>
            </div>
            
            <div>
              <div className="border rounded-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Store Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Contact</h3>
                    <p className="text-gray-600">info@{store.subdomain}.joelmbaka.site</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9am - 5pm</p>
                    <p className="text-gray-600">Saturday: 10am - 4pm</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Location</h3>
                    <p className="text-gray-600">123 Store Street</p>
                    <p className="text-gray-600">City, State 12345</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('StorePage - Error:', error);
    
    // Instead of throwing the error, show a user-friendly error page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Store Error</h1>
            <p className="text-gray-600 mb-6">
              There was an error loading the store. Please try again later.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
                <p className="font-medium mb-2">Error details:</p>
                <p className="text-red-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                <p className="font-medium mb-2">Try these solutions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refresh the page</li>
                  <li>Clear your browser cache</li>
                  <li>Try again later</li>
                </ul>
              </div>
              
              <Link 
                href="https://joelmbaka.site" 
                className="inline-block w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg text-center transition-colors"
              >
                Go to Main Site
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 