// app/store/[subdomain]/products/page.tsx
'use client'; // Ensure this is a client component

import React, { useEffect, useState } from 'react';
import { getStoreBySubdomain, getProductsByStoreId } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ subdomain: string }>; 
}

const StoreProductsPage = ({ params }: PageProps) => {
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { subdomain } = await params;
        const fetchedStore = await getStoreBySubdomain(subdomain);

        if (!fetchedStore) {
          notFound(); // Handle store not found
          return;
        }

        setStore(fetchedStore);
        const fetchedProducts = await getProductsByStoreId(fetchedStore.id);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (!products || products.length === 0) {
    return <div>No products available.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Products for {store?.name}</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default StoreProductsPage;