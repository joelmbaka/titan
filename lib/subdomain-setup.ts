import { createDnsRecordForDomain } from './vercel-dns';
import { Store } from './types';
import { env } from "@/env";

/**
 * Checks if a DNS record already exists for a subdomain
 */
async function checkExistingDnsRecord(subdomain: string): Promise<boolean> {
  try {
    console.log(`Checking for existing DNS records for ${subdomain}...`);
    
    const token = env.VERCEL_API_TOKEN;
    const teamId = env.VERCEL_TEAM_ID;
    
    if (!token) {
      console.error("Vercel API token is missing");
      return false;
    }
    
    if (!teamId) {
      console.error("Vercel team ID is missing");
      return false;
    }
    
    // List all DNS records to find if the subdomain exists
    const listUrl = `https://api.vercel.com/v2/domains/joelmbaka.site/records?teamId=${teamId}`;
    const listResponse = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!listResponse.ok) {
      console.error(`Failed to list DNS records: ${listResponse.status}`);
      return false;
    }
    
    const records = await listResponse.json();
    console.log(`Found ${records.records.length} DNS records`);
    
    const existingRecord = records.records.find(
      (record: any) => record.name === subdomain
    );
    
    if (existingRecord) {
      console.log(`Existing DNS record found for ${subdomain}: ${existingRecord.id}`);
      return true;
    }
    
    console.log(`No existing DNS record found for ${subdomain}`);
    return false;
  } catch (error) {
    console.error('Error checking existing DNS record:', error);
    return false;
  }
}

/**
 * Sets up a subdomain for a store
 */
export async function setupStoreSubdomain(store: Store): Promise<{ success: boolean; message: string }> {
  try {
    if (!store.subdomain) {
      return {
        success: false,
        message: "Store has no subdomain specified",
      };
    }

    console.log(`Setting up subdomain for store: ${store.name} (${store.subdomain})`);

    // Step 1: Check if a DNS record already exists for this subdomain
    const recordExists = await checkExistingDnsRecord(store.subdomain);
    if (recordExists) {
      return {
        success: false,
        message: `Subdomain ${store.subdomain}.joelmbaka.site already exists. Please choose a different subdomain.`,
      };
    }

    // Step 2: Create the DNS record
    const result = await createDnsRecordForDomain(store.subdomain);

    if (!result.success) {
      console.error(`Failed to set up subdomain for ${store.subdomain}: ${result.message}`);
      return result;
    }

    console.log(`Successfully set up subdomain for ${store.subdomain}`);
    return {
      success: true,
      message: `Subdomain ${store.subdomain}.joelmbaka.site is now active`,
    };
  } catch (error) {
    console.error(`Error setting up subdomain for ${store?.subdomain}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
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