// Test script for subdomain setup
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

try {
  const envConfig = await fs.readFile(envPath, 'utf8');
  const envVars = dotenv.parse(envConfig);
  
  // Set environment variables
  for (const key in envVars) {
    process.env[key] = envVars[key];
  }
} catch (error) {
  console.error('Error loading .env.local file:', error);
}

// Check if a DNS record exists for a subdomain
async function checkDnsRecord(subdomain) {
  try {
    console.log(`Checking DNS record for subdomain: ${subdomain}`);
    
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    
    if (!token) {
      console.error('VERCEL_API_TOKEN is missing');
      return { exists: false, error: 'VERCEL_API_TOKEN is missing' };
    }
    
    if (!teamId) {
      console.error('VERCEL_TEAM_ID is missing');
      return { exists: false, error: 'VERCEL_TEAM_ID is missing' };
    }
    
    // List all DNS records
    const url = `https://api.vercel.com/v2/domains/joelmbaka.site/records?teamId=${teamId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to list DNS records:', error);
      return { exists: false, error: error.error?.message || 'Failed to list DNS records' };
    }
    
    const data = await response.json();
    console.log(`Found ${data.records.length} DNS records`);
    
    // Check if the subdomain exists
    const record = data.records.find(record => record.name === subdomain);
    
    if (record) {
      console.log(`Found existing DNS record for ${subdomain}:`, record);
      return { exists: true, record };
    }
    
    console.log(`No DNS record found for ${subdomain}`);
    return { exists: false };
  } catch (error) {
    console.error('Error checking DNS record:', error);
    return { exists: false, error: error.message };
  }
}

// Create a DNS record for a subdomain
async function createDnsRecord(subdomain) {
  try {
    console.log(`Creating DNS record for subdomain: ${subdomain}`);
    
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    
    if (!token) {
      console.error('VERCEL_API_TOKEN is missing');
      return { success: false, error: 'VERCEL_API_TOKEN is missing' };
    }
    
    if (!teamId) {
      console.error('VERCEL_TEAM_ID is missing');
      return { success: false, error: 'VERCEL_TEAM_ID is missing' };
    }
    
    // Create the DNS record
    const url = `https://api.vercel.com/v2/domains/joelmbaka.site/records?teamId=${teamId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: subdomain,
        type: 'CNAME',
        value: 'cname.vercel-dns.com',
        ttl: 60,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to create DNS record:', error);
      return { success: false, error: error.error?.message || 'Failed to create DNS record' };
    }
    
    const data = await response.json();
    console.log(`DNS record created successfully for ${subdomain}.joelmbaka.site:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('Error creating DNS record:', error);
    return { success: false, error: error.message };
  }
}

// Test the subdomain setup process
async function testSubdomainSetup() {
  try {
    // Generate a unique subdomain for testing
    const timestamp = Date.now();
    const subdomain = `test-${timestamp}`;
    
    console.log(`Testing subdomain setup for: ${subdomain}`);
    
    // Step 1: Check if the subdomain already exists
    const checkResult = await checkDnsRecord(subdomain);
    
    if (checkResult.exists) {
      console.log(`Subdomain ${subdomain} already exists, skipping creation`);
      return;
    }
    
    // Step 2: Create the DNS record
    const createResult = await createDnsRecord(subdomain);
    
    if (!createResult.success) {
      console.error(`Failed to create DNS record for ${subdomain}:`, createResult.error);
      return;
    }
    
    console.log(`Successfully set up subdomain: ${subdomain}.joelmbaka.site`);
    
    // Step 3: Verify the DNS record was created
    const verifyResult = await checkDnsRecord(subdomain);
    
    if (verifyResult.exists) {
      console.log(`Verified DNS record for ${subdomain} exists`);
    } else {
      console.error(`Failed to verify DNS record for ${subdomain}`);
    }
  } catch (error) {
    console.error('Error testing subdomain setup:', error);
  }
}

// Run the test
testSubdomainSetup(); 