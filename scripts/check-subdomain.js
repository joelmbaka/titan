// Script to check if a subdomain is available
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

async function loadEnv() {
  try {
    console.log(`Loading environment variables from ${envPath}`);
    const envConfig = await fs.readFile(envPath, 'utf8');
    const envVars = dotenv.parse(envConfig);
    
    // Set environment variables
    for (const key in envVars) {
      process.env[key] = envVars[key];
    }
    
    return true;
  } catch (error) {
    console.error('Error loading .env.local file:', error);
    return false;
  }
}

// Function to check if a DNS record exists for a subdomain
async function checkDnsRecord(subdomain) {
  try {
    console.log(`Checking DNS record for subdomain: ${subdomain}`);
    
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    
    if (!token || !teamId) {
      console.error('Missing required environment variables');
      return { exists: false, error: 'Missing required environment variables' };
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

// Function to check if a subdomain is available
async function checkSubdomainAvailability(subdomain) {
  try {
    console.log(`Checking availability for subdomain: ${subdomain}`);
    
    // Check if the subdomain has a DNS record
    const dnsResult = await checkDnsRecord(subdomain);
    
    if (dnsResult.exists) {
      console.log(`Subdomain ${subdomain} has an existing DNS record`);
      return { available: false, reason: 'DNS record exists' };
    }
    
    // Check if the subdomain is accessible
    try {
      const url = `https://${subdomain}.joelmbaka.site/api/health-check`;
      console.log(`Checking if ${url} is accessible...`);
      
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        timeout: 5000, // 5 second timeout
      });
      
      if (response.ok) {
        console.log(`Subdomain ${subdomain} is accessible`);
        return { available: false, reason: 'Subdomain is accessible' };
      }
      
      console.log(`Subdomain ${subdomain} is not accessible (status: ${response.status})`);
    } catch (error) {
      // If the fetch fails, the subdomain is likely not accessible
      console.log(`Subdomain ${subdomain} is not accessible (error: ${error.message})`);
    }
    
    console.log(`Subdomain ${subdomain} appears to be available`);
    return { available: true };
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return { available: false, error: error.message };
  }
}

// Main function
async function main() {
  try {
    // Load environment variables
    await loadEnv();
    
    // Get the subdomain from command line arguments
    const subdomain = process.argv[2];
    
    if (!subdomain) {
      console.error('Please provide a subdomain as a command line argument');
      console.log('Usage: node check-subdomain.js <subdomain>');
      return;
    }
    
    console.log(`Checking availability for subdomain: ${subdomain}`);
    
    // Check if the subdomain is available
    const result = await checkSubdomainAvailability(subdomain);
    
    if (result.available) {
      console.log(`✅ Subdomain ${subdomain} is available`);
    } else {
      console.log(`❌ Subdomain ${subdomain} is not available: ${result.reason || result.error || 'Unknown reason'}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main(); 