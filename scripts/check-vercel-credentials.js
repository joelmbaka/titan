// Script to check Vercel credentials
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

async function checkVercelCredentials() {
  try {
    // Load environment variables
    await loadEnv();
    
    // Check for required environment variables
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    
    console.log('Checking Vercel credentials:');
    console.log(`VERCEL_API_TOKEN: ${token ? '✓ Present' : '✗ Missing'}`);
    console.log(`VERCEL_TEAM_ID: ${teamId ? '✓ Present' : '✗ Missing'}`);
    
    if (!token || !teamId) {
      console.error('Missing required environment variables');
      return;
    }
    
    // Test the Vercel API
    console.log('\nTesting Vercel API access...');
    
    const url = `https://api.vercel.com/v9/projects?teamId=${teamId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to access Vercel API:', error);
      return;
    }
    
    const data = await response.json();
    console.log(`✓ Successfully accessed Vercel API`);
    console.log(`Found ${data.projects?.length || 0} projects`);
    
    // Test DNS API
    console.log('\nTesting Vercel DNS API access...');
    
    const dnsUrl = `https://api.vercel.com/v2/domains/joelmbaka.site/records?teamId=${teamId}`;
    const dnsResponse = await fetch(dnsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!dnsResponse.ok) {
      const error = await dnsResponse.json();
      console.error('Failed to access Vercel DNS API:', error);
      return;
    }
    
    const dnsData = await dnsResponse.json();
    console.log(`✓ Successfully accessed Vercel DNS API`);
    console.log(`Found ${dnsData.records?.length || 0} DNS records for joelmbaka.site`);
    
    console.log('\nVercel credentials are valid and working correctly!');
  } catch (error) {
    console.error('Error checking Vercel credentials:', error);
  }
}

// Run the check
checkVercelCredentials(); 