import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function StoreProductsPage({ params }: PageProps) {
  try {
    // Await the params promise
    const { subdomain } = await params;
    console.log('StoreProductsPage - Subdomain:', subdomain);

    const store = await getStoreBySubdomain(subdomain);
    console.log('StoreProductsPage - Store data:', store);

    if (!store) {
      console.log('StoreProductsPage - Store not found');
      return notFound();
    }

    // Mock products data - in a real app, you would fetch this from your API
    const products = [
      {
        id: '1',
        name: 'Product 1',
        description: 'This is a description for product 1',
        price: 19.99,
        image: '/placeholder.jpg'
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'This is a description for product 2',
        price: 29.99,
        image: '/placeholder.jpg'
      },
      {
        id: '3',
        name: 'Product 3',
        description: 'This is a description for product 3',
        price: 39.99,
        image: '/placeholder.jpg'
      },
      {
        id: '4',
        name: 'Product 4',
        description: 'This is a description for product 4',
        price: 49.99,
        image: '/placeholder.jpg'
      },
      {
        id: '5',
        name: 'Product 5',
        description: 'This is a description for product 5',
        price: 59.99,
        image: '/placeholder.jpg'
      },
      {
        id: '6',
        name: 'Product 6',
        description: 'This is a description for product 6',
        price: 69.99,
        image: '/placeholder.jpg'
      }
    ];

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Browse our collection of high-quality products</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full md:w-80 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                <option value="category1">Category 1</option>
                <option value="category2">Category 2</option>
                <option value="category3">Category 3</option>
              </select>
              <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <p className="text-gray-500">Product Image</p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-blue-600 font-medium mb-2">${product.price.toFixed(2)}</p>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex justify-between">
                  <Link 
                    href={`/store/${subdomain}/products/${product.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-1 rounded border hover:bg-gray-100">Previous</button>
            <button className="px-3 py-1 rounded border bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 rounded border hover:bg-gray-100">2</button>
            <button className="px-3 py-1 rounded border hover:bg-gray-100">3</button>
            <button className="px-3 py-1 rounded border hover:bg-gray-100">Next</button>
          </nav>
        </div>
      </div>
    );
  } catch (error) {
    console.error('StoreProductsPage - Error:', error);
    throw error;
  }
} 