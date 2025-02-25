import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/storeFunctions.server";

// Define the Store type
interface Store {
  id: string;
  name: string;
  subdomain: string;
  industry: string;
  metrics?: {
    sales: number;
    visitors: number;
    conversion: number;
  };
}

// Function to get store by subdomain
async function getStoreBySubdomain(subdomain: string): Promise<Store | null> {
  try {
    console.log(`Fetching store with subdomain: ${subdomain}`);
    
    const result = await executeQuery(
      `MATCH (s:Store {subdomain: $subdomain}) RETURN s`,
      { subdomain }
    );
    
    if (result.records.length === 0) {
      console.log(`No store found with subdomain: ${subdomain}`);
      return null;
    }
    
    const store = result.records[0].get("s").properties;
    console.log(`Found store: ${store.name}`);
    
    return {
      ...store,
      metrics: store.metrics || {
        sales: 0,
        visitors: 0,
        conversion: 0
      }
    };
  } catch (error) {
    console.error(`Error fetching store by subdomain ${subdomain}:`, error);
    return null;
  }
}

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { subdomain: string } 
}): Promise<Metadata> {
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
}

export default async function StorePage({ 
  params 
}: { 
  params: { subdomain: string } 
}) {
  console.log('StorePage - Rendering page for subdomain:', params.subdomain);
  
  const store = await getStoreBySubdomain(params.subdomain);
  console.log('StorePage - Store data:', store);
  
  if (!store) {
    console.log('StorePage - Store not found');
    notFound();
  }
  
  // Increment visitor count (you can implement this later)
  // await incrementVisitorCount(store.id);
  
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">{store.name}</h1>
          <p className="text-gray-600">Welcome to our store!</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
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
      </main>
      
      <footer className="bg-gray-100 border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">{store.name}</h2>
              <p className="text-gray-600">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Powered by Titan 2.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 