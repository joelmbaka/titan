import { getStoreBySubdomain } from '@/lib/storeFunctions.server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  params: { subdomain: string };
}

export default async function StoreLayout({ children, params }: LayoutProps) {
  console.log('StoreLayout - Rendering layout');
  
  try {
    const { subdomain } = params;
    console.log('StoreLayout - Subdomain:', subdomain);

    const store = await getStoreBySubdomain(subdomain);
    console.log('StoreLayout - Store data:', store);

    if (!store) {
      console.log('StoreLayout - Store not found');
      return notFound();
    }

    console.log('StoreLayout - Rendering store layout');
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{store.name}</h1>
                <p className="text-sm text-gray-500">{store.industry}</p>
              </div>
              <nav>
                <ul className="flex space-x-6">
                  <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
                  <li><Link href="/products" className="hover:text-blue-600">Products</Link></li>
                  <li><Link href="/blog" className="hover:text-blue-600">Blog</Link></li>
                  <li><Link href="/about" className="hover:text-blue-600">About</Link></li>
                  <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-gray-100 border-t">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
              <p className="text-sm text-gray-500">Powered by Titan 2.0</p>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('StoreLayout - Error:', error);
    throw error;
  }
} 