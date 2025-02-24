import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function StoreLayout({ children, params }: LayoutProps) {
  // Await the params promise
  const { subdomain } = await params;
  const store = await getStoreBySubdomain(subdomain);

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