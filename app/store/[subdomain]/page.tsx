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
    
    // Get middleware headers for debugging (keeping for backend logging only)
    const headersList = headers();
    const middlewareSubdomain = headersList.get('x-middleware-subdomain');
    const middlewareRewrite = headersList.get('x-middleware-rewrite');
    
    // Log debug info but don't display it
    console.log('Debug Info:', {
      subdomain: params.subdomain,
      middlewareSubdomain,
      middlewareRewrite,
      storeId: store.id,
      timestamp: new Date().toISOString()
    });
    
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold mb-4">{store.name}</h1>
              <p className="text-lg text-gray-700">
                Your trusted partner in {store.industry.toLowerCase().replace(/_/g, ' ')}.
                We provide high-quality products and exceptional service.
              </p>
            </div>
          </section>
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b">Featured Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                    <h3 className="font-semibold text-lg">Premium Crop Seeds</h3>
                    <p className="text-gray-600 text-sm mb-2">High-yield, disease-resistant seeds for optimal growth</p>
                    <p className="font-bold text-blue-600">$49.99</p>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                    <h3 className="font-semibold text-lg">Organic Fertilizer</h3>
                    <p className="text-gray-600 text-sm mb-2">100% natural, environmentally friendly soil enrichment</p>
                    <p className="font-bold text-blue-600">$29.99</p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Link 
                    href="/products" 
                    className="inline-block px-4 py-2 text-blue-600 hover:underline"
                  >
                    View All Products →
                  </Link>
                </div>
              </section>
              
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b">About Us</h2>
                <p className="text-gray-700 mb-4">
                  Welcome to {store.name}! We're dedicated to providing the best products and services to our customers
                  in the {store.industry.toLowerCase().replace(/_/g, ' ')} industry.
                </p>
                <p className="text-gray-700 mb-4">
                  With years of experience and a commitment to quality, we've established ourselves as a trusted
                  provider of agricultural solutions that help farmers maximize their yields and profitability.
                </p>
                <p className="text-gray-700">
                  Our team of experts is always available to provide guidance and support, ensuring that you have
                  the knowledge and tools you need to succeed in your agricultural endeavors.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b">Our Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">Crop Consulting</h3>
                    <p className="text-gray-600">Expert advice on crop selection, planting strategies, and pest management</p>
                  </div>
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">Soil Analysis</h3>
                    <p className="text-gray-600">Comprehensive soil testing to optimize fertilization and irrigation</p>
                  </div>
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">Equipment Rental</h3>
                    <p className="text-gray-600">Access to modern farming equipment without the high investment costs</p>
                  </div>
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">Harvest Support</h3>
                    <p className="text-gray-600">Assistance with harvesting, storage, and distribution of your crops</p>
                  </div>
                </div>
              </section>
            </div>
            
            <div>
              <div className="border rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 pb-2 border-b">Store Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Contact</h3>
                    <p className="text-gray-600">info@{store.subdomain}.joelmbaka.site</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9am - 5pm</p>
                    <p className="text-gray-600">Saturday: 10am - 4pm</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Location</h3>
                    <p className="text-gray-600">123 Farm Road</p>
                    <p className="text-gray-600">Agriville, AG 12345</p>
                  </div>
                  <div className="pt-4 mt-4 border-t">
                    <Link 
                      href="/contact" 
                      className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Contact Us
                    </Link>
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
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                <p className="font-medium mb-2">Try these solutions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refresh the page</li>
                  <li>Clear your browser cache</li>
                  <li>Try again later</li>
                </ul>
              </div>
              
              <Link 
                href="/" 
                className="inline-block w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg text-center transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 