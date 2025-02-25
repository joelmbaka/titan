# Subdomain Setup Solution for Titan 2.0

This document outlines the solution implemented to fix the "DEPLOYMENT_NOT_FOUND" error that occurred during store creation in the Titan 2.0 platform.

## Problem

When creating a new store, users encountered a "DEPLOYMENT_NOT_FOUND" error (404) during the subdomain setup process. This was caused by DNS record conflicts when attempting to create a new CNAME record for a subdomain that already had an existing record.

## Solution Overview

The solution implements a robust subdomain setup process with the following features:

1. **Subdomain Availability Check**: Automatically checks if a subdomain already exists before attempting to create a new one.
2. **User-Friendly Error Messages**: Provides clear feedback when a subdomain is already in use.
3. **Manual Setup**: Added a UI component to allow users to manually trigger subdomain setup if automatic setup fails.
4. **User Feedback**: Enhanced UI to provide clear feedback on the subdomain setup process.
5. **Utility Scripts**: Created scripts for managing DNS records and checking subdomain availability.

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

If you encounter a DNS record conflict, you can delete the conflicting record:

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

## Conclusion

The implemented solution addresses the "DEPLOYMENT_NOT_FOUND" error by:

1. Checking for existing DNS records before attempting to create new ones
2. Providing clear error messages to users
3. Offering manual setup options when automatic setup fails
4. Creating utility scripts for managing DNS records

These changes ensure a more robust and user-friendly subdomain setup process for the Titan 2.0 platform. 