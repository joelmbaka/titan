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
    // Await the params promise
    const { subdomain } = await params;
    console.log('StoreProductsPage - Subdomain:', subdomain);

    const store = await getStoreBySubdomain(subdomain);
    console.log('StoreProductsPage - Store data:', store);

    if (!store) {
      console.log('StoreProductsPage - Store not found');
      return notFound();
    }

    // Fetch real products from the database
    const products = await getProductsByStoreId(store.id);
    
    // If no products are found, use mock data for demonstration
    const displayProducts = products.length > 0 ? products : [
      {
        id: '1',
        name: 'Product 1',
        description: 'This is a description for product 1',
        price: 19.99,
        image: '/placeholder.jpg'
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'This is a description for product 2',
        price: 29.99,
        image: '/placeholder.jpg'
      },
      {
        id: '3',
        name: 'Product 3',
        description: 'This is a description for product 3',
        price: 39.99,
        image: '/placeholder.jpg'
      },
      {
        id: '4',
        name: 'Product 4',
        description: 'This is a description for product 4',
        price: 49.99,
        image: '/placeholder.jpg'
      },
      {
        id: '5',
        name: 'Product 5',
        description: 'This is a description for product 5',
        price: 59.99,
        image: '/placeholder.jpg'
      },
      {
        id: '6',
        name: 'Product 6',
        description: 'This is a description for product 6',
        price: 69.99,
        image: '/placeholder.jpg'
      }
    ];

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Browse our collection of high-quality products</p>
        </div>

        <ProductsClient products={displayProducts} subdomain={subdomain} />
      </div>
    );
  } catch (error) {
    console.error('StoreProductsPage - Error:', error);
    throw error;
  }
} 