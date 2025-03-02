import { getProductsByStoreId } from '@/lib/storeFunctions';

const testFetchProducts = async () => {
  const storeId = '894178a0-4c3b-4550-abcb-f3af2628da5f'; // Specific store ID for testing

  try {
    const products = await getProductsByStoreId(storeId);
    console.log('Fetched products:', products);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

testFetchProducts(); 