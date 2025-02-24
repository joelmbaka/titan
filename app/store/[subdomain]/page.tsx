import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';

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
      <div>
        <h1>Welcome to {store.name}</h1>
        <p>Your subdomain: {subdomain}.joelmbaka.site</p>
      </div>
    );
  } catch (error) {
    console.error('StoreHomepage - Error:', error);
    throw error;
  }
} 