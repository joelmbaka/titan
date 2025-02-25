# Subdomain Setup Solution for Titan 2.0

This document outlines the solution implemented to fix the "DEPLOYMENT_NOT_FOUND" error that occurred during store creation in the Titan 2.0 platform.

## Problem

When creating a new store, users encountered a "DEPLOYMENT_NOT_FOUND" error (404) during the subdomain setup process. This was caused by DNS record conflicts when attempting to create a new CNAME record for a subdomain that already had an existing record.

## Root Causes

The "DEPLOYMENT_NOT_FOUND" error can occur for several reasons:

1. **DNS Record Exists but No Deployment**: A DNS record points to Vercel, but no corresponding deployment exists
2. **DNS Propagation Delay**: The DNS record has been created, but DNS changes haven't fully propagated
3. **Vercel Configuration Issues**: The Vercel project isn't properly configured to handle the subdomain
4. **Stale DNS Records**: Old DNS records that point to non-existent deployments

## Solution Overview

The solution implements a robust subdomain setup process with the following features:

1. **Subdomain Availability Check**: Automatically checks if a subdomain already exists before attempting to create a new one.
2. **User-Friendly Error Messages**: Provides clear feedback when a subdomain is already in use.
3. **Manual Setup**: Added a UI component to allow users to manually trigger subdomain setup if automatic setup fails.
4. **User Feedback**: Enhanced UI to provide clear feedback on the subdomain setup process.
5. **Utility Scripts**: Created scripts for managing DNS records and checking subdomain availability.
6. **DNS Record Management**: Tools to delete and recreate DNS records when needed.

## Implementation Details

### 1. Subdomain Setup Logic

The `setupStoreSubdomain` function in `lib/subdomain-setup.ts` was enhanced to:
- Check if a DNS record already exists for the subdomain
- Provide clear error messages if the subdomain is already in use
- Handle errors gracefully

### 2. Vercel DNS Integration

The `createDnsRecordForDomain` function in `lib/vercel-dns.ts` was updated to:
- Validate environment variables
- Provide detailed error messages for different failure scenarios
- Log the process for easier debugging

### 3. Manual Subdomain Setup

A new API endpoint at `app/api/setup-subdomain/route.ts` was created to:
- Allow users to manually trigger subdomain setup
- Verify user ownership of the store
- Return detailed error information

### 4. UI Components

The following UI components were added or enhanced:
- `components/setup-subdomain-button.tsx`: A button component for manually triggering subdomain setup
- `components/store-card.tsx`: Updated to include the subdomain setup button

### 5. Utility Scripts

Several utility scripts were created in the `scripts` directory:
- `check-vercel-credentials.js`: Checks if Vercel API token and team ID are valid
- `test-subdomain-setup.js`: Tests the subdomain setup process
- `delete-dns-record.js`: Deletes a DNS record for a specific subdomain
- `check-subdomain.js`: Checks if a subdomain is available for use

## How to Use

### Checking Subdomain Availability

Before creating a store, you can check if a subdomain is available:

```
cd scripts
npm run check-subdomain <subdomain>
```

### Deleting Conflicting DNS Records

If you encounter a DNS record conflict or a "DEPLOYMENT_NOT_FOUND" error, you can delete the conflicting record:

```
cd scripts
npm run delete-dns <subdomain>
```

### Manual Subdomain Setup

If automatic subdomain setup fails, you can manually trigger it:

1. Go to the Stores page in your dashboard
2. Find the store card for the store you want to set up a subdomain for
3. Click the "Subdomain Setup" button
4. Click the "Setup Subdomain" button in the expanded section

## Troubleshooting "DEPLOYMENT_NOT_FOUND" Errors

If you encounter a "DEPLOYMENT_NOT_FOUND" error when accessing a store subdomain, follow these steps:

1. **Check DNS Record**: Verify if the DNS record exists using the check-subdomain script
   ```
   cd scripts
   npm run check-subdomain <subdomain>
   ```

2. **Delete and Recreate**: If the DNS record exists but the deployment is not found, delete the record and set it up again
   ```
   cd scripts
   npm run delete-dns <subdomain>
   ```
   Then trigger the subdomain setup again from the store card in the dashboard.

3. **Verify Vercel Configuration**: Ensure that your Vercel project is configured to handle subdomains
   ```
   cd scripts
   npm run check-vercel
   ```

4. **Wait for DNS Propagation**: DNS changes can take time to propagate (up to 48 hours in some cases)

5. **Check Store Status**: Ensure the store is properly created and has a valid subdomain assigned

## Conclusion

The implemented solution addresses the "DEPLOYMENT_NOT_FOUND" error by:

1. Checking for existing DNS records before attempting to create new ones
2. Providing clear error messages to users
3. Offering manual setup options when automatic setup fails
4. Creating utility scripts for managing DNS records
5. Providing troubleshooting steps for resolving deployment issues

These changes ensure a more robust and user-friendly subdomain setup process for the Titan 2.0 platform. 