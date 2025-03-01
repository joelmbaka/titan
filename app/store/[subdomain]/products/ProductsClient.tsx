'use client';

import React from 'react';
import Link from 'next/link';
import AddToCartButton from '../components/AddToCartButton';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface ProductsClientProps {
  products: Product[];
  subdomain: string;
}

export default function ProductsClient({ products, subdomain }: ProductsClientProps) {
  return (
    <div>
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full md:w-80 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="category1">Category 1</option>
              <option value="category2">Category 2</option>
              <option value="category3">Category 3</option>
            </select>
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
            <div className="bg-gray-100 h-48 flex items-center justify-center">
              <p className="text-gray-500">Product Image</p>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-blue-600 font-medium mb-2">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
              <div className="flex justify-between">
                <Link 
                  href={`/store/${subdomain}/products/${product.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </Link>
                <AddToCartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: typeof product.price === 'number' ? product.price : parseFloat(product.price)
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-1 rounded border hover:bg-gray-100">Previous</button>
          <button className="px-3 py-1 rounded border bg-blue-600 text-white">1</button>
          <button className="px-3 py-1 rounded border hover:bg-gray-100">2</button>
          <button className="px-3 py-1 rounded border hover:bg-gray-100">3</button>
          <button className="px-3 py-1 rounded border hover:bg-gray-100">Next</button>
        </nav>
      </div>
    </div>
  );
} 