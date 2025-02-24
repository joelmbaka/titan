import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  params: { subdomain: string };
}

export default async function StoreLayout({ children, params }: LayoutProps) {
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