// Script to delete a DNS record
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

// Function to find a DNS record by subdomain
async function findDnsRecord(subdomain) {
  try {
    console.log(`Finding DNS record for subdomain: ${subdomain}`);
    
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    
    if (!token || !teamId) {
      console.error('Missing required environment variables');
      return null;
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
      return null;
    }
    
    const data = await response.json();
    console.log(`Found ${data.records.length} DNS records`);
    
    // Find the record for the subdomain
    const record = data.records.find(record => record.name === subdomain);
    
    if (record) {
      console.log(`Found DNS record for ${subdomain}:`, record);
      return record;
    }
    
    console.log(`No DNS record found for ${subdomain}`);
    return null;
  } catch (error) {
    console.error('Error finding DNS record:', error);
    return null;
  }
}

// Function to delete a DNS record
async function deleteDnsRecord(recordId) {
  try {
    console.log(`Deleting DNS record with ID: ${recordId}`);
    
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    
    if (!token || !teamId) {
      console.error('Missing required environment variables');
      return false;
    }
    
    // Delete the DNS record
    const url = `https://api.vercel.com/v2/domains/joelmbaka.site/records/${recordId}?teamId=${teamId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to delete DNS record:', error);
      return false;
    }
    
    console.log(`DNS record deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error deleting DNS record:', error);
    return false;
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
      console.log('Usage: node delete-dns-record.js <subdomain>');
      return;
    }
    
    console.log(`Deleting DNS record for subdomain: ${subdomain}`);
    
    // Find the DNS record
    const record = await findDnsRecord(subdomain);
    
    if (!record) {
      console.error(`No DNS record found for ${subdomain}`);
      return;
    }
    
    // Delete the DNS record
    const success = await deleteDnsRecord(record.id);
    
    if (success) {
      console.log(`Successfully deleted DNS record for ${subdomain}`);
    } else {
      console.error(`Failed to delete DNS record for ${subdomain}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main(); 