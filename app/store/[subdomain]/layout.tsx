import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function StoreLayout({ children, params }: LayoutProps) {
  console.log('StoreLayout - Rendering layout');
  
  try {
    // Await the params promise
    const { subdomain } = await params;
    console.log('StoreLayout - Subdomain:', subdomain);

    const store = await getStoreBySubdomain(subdomain);
    console.log('StoreLayout - Store data:', store);

    if (!store) {
      console.log('StoreLayout - Store not found');
      return notFound();
    }

    console.log('StoreLayout - Rendering store layout');
    return (
      <div>
        <header>
          <h1>{store.name}</h1>
          <p>{store.industry}</p>
        </header>
        <main>{children}</main>
      </div>
    );
  } catch (error) {
    console.error('StoreLayout - Error:', error);
    throw error;
  }
} 