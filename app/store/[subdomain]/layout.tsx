import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  const store = await getStoreBySubdomain(params.subdomain);

  if (!store) {
    return notFound();
  }

  return (
    <div>
      <header>
        <h1>{store.name}</h1>
        <p>{store.industry}</p>
      </header>
      <main>{children}</main>
    </div>
  );
} 