'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

interface ProductFeature {
  name: string;
  value: string;
}

interface ProductSpecification {
  [key: string]: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  features?: string[];
  specifications?: ProductSpecification;
}

interface ProductDetailClientProps {
  product: Product;
  subdomain: string;
  relatedProducts?: Product[];
}

export default function ProductDetailClient({ product, subdomain, relatedProducts = [] }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Link 
          href="/products"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>←</span> Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">Product Image</p>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl text-blue-600 font-medium mb-4">
              ${product.price.toFixed(2)}
            </p>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
              
              {product.features && product.features.length > 0 && (
                <>
                  <h3 className="font-semibold text-lg mb-2">Features:</h3>
                  <ul className="list-disc pl-5 mb-4">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-gray-700 mb-1">{feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-32">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <select 
                  id="quantity" 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-200"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
            
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-2">Specifications:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                <div className="bg-gray-100 h-40 flex items-center justify-center">
                  <p className="text-gray-500">Product Image</p>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{relatedProduct.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">${relatedProduct.price.toFixed(2)}</p>
                  <div className="flex justify-between">
                    <Link 
                      href={`/products/${relatedProduct.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 