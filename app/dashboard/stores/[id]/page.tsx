import { getStore } from '@/lib/api/stores';
import { notFound } from 'next/navigation';
import { StoreHeader } from '@/components/store-header';
import { StoreTabs } from '@/components/store-tabs';

export default async function StorePage({ params }: { params: { id: string } }) {
  const store = await getStore(params.id);

  if (!store) {
    return notFound();
  }

  return (
    <div className="flex flex-col">
      <StoreHeader store={store} />
      <StoreTabs storeId={store.id} />
    </div>
  );
} 