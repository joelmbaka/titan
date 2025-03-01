'use client';

import React from 'react';
import { useCart } from '@/lib/cart-context';

interface ProductProps {
  id: string;
  name: string;
  price: number;
}

export default function AddToCartButton({ product }: { product: ProductProps }) {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  };
  
  return (
    <button 
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
      onClick={handleAddToCart}
    >
      Add to Cart
    </button>
  );
} 