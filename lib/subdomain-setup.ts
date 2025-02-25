import { createDnsRecordForDomain } from './vercel-dns';
import { Store } from './types';

/**
 * Sets up a subdomain for a store
 * This function creates a DNS record and configures the subdomain
 */
export async function setupStoreSubdomain(store: Store): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Setting up subdomain for store: ${store.name} (${store.subdomain})`);
    
    // Create the DNS record
    const dnsResult = await createDnsRecordForDomain(`${store.subdomain}.joelmbaka.site`, {
      name: store.subdomain,
      type: "CNAME",
      value: "cname.vercel-dns.com",
      ttl: 60,
    });
    
    if (!dnsResult.success) {
      console.error(`Failed to create DNS record for ${store.subdomain}.joelmbaka.site:`, dnsResult.message);
      return dnsResult;
    }
    
    console.log(`DNS record created successfully for ${store.subdomain}.joelmbaka.site`);
    
    // Here you could add additional setup steps if needed
    // For example, triggering a deployment or configuring additional settings
    
    return { 
      success: true, 
      message: `Subdomain ${store.subdomain}.joelmbaka.site set up successfully` 
    };
  } catch (error) {
    console.error('Error setting up store subdomain:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Checks if a subdomain is available
 */
export async function checkSubdomainAvailability(subdomain: string): Promise<boolean> {
  try {
    // Check if the subdomain is already in use
    const response = await fetch(`https://${subdomain}.joelmbaka.site/api/health-check`, {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
    // If we get a response, the subdomain is already in use
    return response.status === 404;
  } catch (error) {
    // If the fetch fails, the subdomain is likely available
    return true;
  }
} 