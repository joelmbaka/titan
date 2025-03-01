import { getStoreBySubdomain, getProductById, getProductsByStoreId } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: { subdomain: string; productId: string };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { subdomain, productId } = params;

  try {
    const store = await getStoreBySubdomain(subdomain);
    
    if (!store) {
      return notFound();
    }

    // Fetch the product by ID
    const product = await getProductById(productId);
    
    // If no product is found, use mock data for demonstration
    const displayProduct = product || {
      id: productId,
      name: 'Sample Product',
      description: 'This is a detailed description of the sample product. It includes information about the features, benefits, and specifications of the product.',
      price: 99.99,
      image: '/placeholder.jpg',
      features: [
        'High-quality materials',
        'Durable construction',
        'Versatile design',
        'Easy to use',
        'Satisfaction guaranteed'
      ],
      specifications: {
        dimensions: '10 x 5 x 2 inches',
        weight: '1.5 pounds',
        color: 'Black',
        material: 'Premium grade'
      }
    };

    // Get related products (for demonstration, we'll just get a few products from the store)
    const allProducts = await getProductsByStoreId(store.id);
    
    // Filter out the current product and limit to 4 related products
    const relatedProducts = allProducts.length > 0 
      ? allProducts
          .filter(p => p.id !== productId)
          .slice(0, 4)
      : [
          { id: '1', name: 'Related Product 1', price: 49.99, description: 'Description for related product 1' },
          { id: '2', name: 'Related Product 2', price: 59.99, description: 'Description for related product 2' },
          { id: '3', name: 'Related Product 3', price: 69.99, description: 'Description for related product 3' },
          { id: '4', name: 'Related Product 4', price: 79.99, description: 'Description for related product 4' }
        ];

    return <ProductDetailClient product={displayProduct} subdomain={subdomain} relatedProducts={relatedProducts} />;
  } catch (error) {
    console.error('ProductDetailPage - Error:', error);
    throw error;
  }
} 