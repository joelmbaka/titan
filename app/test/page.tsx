// This is a test/debug file to diagnose issues with accessing the /products page.
import React from 'react';
import { getProductsByStoreId } from '@/lib/storeFunctions';

const TestPage = async () => {
  const storeId = '894178a0-4c3b-4550-abcb-f3af2628da5f'; // Specific store ID for testing

  const products = await getProductsByStoreId(storeId);

  if (!products || products.length === 0) {
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

