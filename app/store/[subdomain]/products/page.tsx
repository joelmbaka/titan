'use client';

import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { getProductsByStoreId } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';
import ProductsClient from './ProductsClient';

interface PageProps {
  params: Promise<{ subdomain: string }>; 
}

export default async function StoreProductsPage({ params }: PageProps) {
  try {
    const { subdomain } = await params;
    const store = await getStoreBySubdomain(subdomain);

    if (!store) {
      return notFound();
    }

    const products = await getProductsByStoreId(store.id);

    if (!products || products.length === 0) {
      return <div>No products available.</div>;
    }

    return (
      <div>
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <ProductsClient products={products} subdomain={subdomain} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return <div>Error loading products.</div>;
  }
} 