import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function StoreHomepage({ params }: PageProps) {
  console.log('StoreHomepage - Rendering page');
  
  try {
    // Await the params promise
    const { subdomain } = await params;
    console.log('StoreHomepage - Subdomain:', subdomain);

    const store = await getStoreBySubdomain(subdomain);
    console.log('StoreHomepage - Store data:', store);

    if (!store) {
      console.log('StoreHomepage - Store not found');
      return notFound();
    }

    console.log('StoreHomepage - Rendering store page');
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg overflow-hidden">
          <div className="container mx-auto px-6 py-16">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to {store.name}</h1>
                <p className="text-xl mb-6">Your premier destination for quality products and services.</p>
                <div className="flex space-x-4">
                  <Link href={`/store/${subdomain}/products`} className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition duration-200">
                    Browse Products
                  </Link>
                  <Link href={`/store/${subdomain}/contact`} className="bg-transparent border border-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-medium transition duration-200">
                    Contact Us
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white p-1 rounded-lg shadow-xl">
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-lg">Store Image Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Categories</h2>
            <p className="text-gray-600">Explore our wide range of products</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Category 1', 'Category 2', 'Category 3'].map((category, index) => (
              <div key={index} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                <div className="bg-gray-100 h-40 flex items-center justify-center">
                  <p className="text-gray-500">Image Placeholder</p>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{category}</h3>
                  <p className="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <Link href={`/store/${subdomain}/products`} className="text-blue-600 hover:text-blue-800 font-medium">
                    View Products →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="bg-gray-50 rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold mb-4">About {store.name}</h2>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. 
                Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus 
                rhoncus ut eleifend nibh porttitor.
              </p>
              <Link href={`/store/${subdomain}/about`} className="text-blue-600 hover:text-blue-800 font-medium">
                Learn More About Us →
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-1 rounded-lg shadow-md">
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-lg">About Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('StoreHomepage - Error:', error);
    throw error;
  }
} 