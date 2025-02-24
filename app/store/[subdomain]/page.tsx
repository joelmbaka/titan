import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';

export default async function StoreHomepage({
  params,
}: {
  params: { subdomain: string };
}) {
  const store = await getStoreBySubdomain(params.subdomain);

  if (!store) {
    return notFound();
  }

  return (
    <div>
      <h1>Welcome to {store.name}</h1>
      <p>Your subdomain: {params.subdomain}.joelmbaka.site</p>
    </div>
  );
} 