"use client"
// This is a test/debug file to diagnose issues with accessing the /products page.
import React, { useEffect, useState } from 'react';
import { getProductsByStoreId } from '@/lib/storeFunctions';
import { getSession } from 'next-auth/react';

const TestPage = () => {
  const [products, setProducts] = useState([]);
  const storeId = '894178a0-4c3b-4550-abcb-f3af2628da5f'; // Specific store ID for testing

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const session = await getSession(); // Fetch the session
        console.log('Session:', session); // Log the session for debugging

        const fetchedProducts = await getProductsByStoreId(storeId);
        console.log('Fetched products:', fetchedProducts);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  if (products.length === 0) {
    return <div>No products available.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Test Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default TestPage;

