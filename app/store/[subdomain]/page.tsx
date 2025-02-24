import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function StoreHomepage({ params }: PageProps) {
  // Await the params promise
  const { subdomain } = await params;
  const store = await getStoreBySubdomain(subdomain);

  if (!store) {
    return notFound();
  }

  return (
    <div>
      <h1>Welcome to {store.name}</h1>
      <p>Your subdomain: {subdomain}.joelmbaka.site</p>
    </div>
  );
} 