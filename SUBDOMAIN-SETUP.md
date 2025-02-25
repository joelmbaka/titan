# Subdomain Setup for Titan 2.0

This document explains how to set up and manage subdomains for stores in the Titan 2.0 platform.

## Overview

Each store in Titan 2.0 can have its own subdomain on the `joelmbaka.site` domain. For example, if your store's subdomain is `mystore`, your store will be accessible at `https://mystore.joelmbaka.site`.

## Automatic Subdomain Setup

When you create a new store, the system will automatically attempt to set up a subdomain for it. This process involves:

1. Creating a DNS record for the subdomain
2. Configuring the subdomain to point to your store

If the automatic setup fails for any reason, you can manually trigger the setup process using the methods described below.

## Manual Subdomain Setup

### Using the UI

1. Go to the Stores page in your dashboard
2. Find the store card for the store you want to set up a subdomain for
3. Click the "Subdomain Setup" button
4. Click the "Setup Subdomain" button in the expanded section
5. Wait for the process to complete
6. Once successful, you can click "Visit Store" to view your store's website

### Using the API

You can also trigger subdomain setup programmatically using the API:

```javascript
// Example using fetch
const response = await fetch('/api/setup-subdomain', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    storeId: 'your-store-id',
    // OR you can use subdomain instead
    // subdomain: 'your-store-subdomain',
  }),
});

const result = await response.json();
console.log(result);
```

## Troubleshooting

If you encounter issues with subdomain setup, check the following:

1. **Vercel API Token**: Ensure that the `VERCEL_API_TOKEN` environment variable is set correctly
2. **Vercel Team ID**: Ensure that the `VERCEL_TEAM_ID` environment variable is set correctly
3. **DNS Propagation**: DNS changes can take time to propagate. Wait a few minutes and try again
4. **Subdomain Availability**: Make sure the subdomain is not already in use

## Environment Variables

The subdomain setup functionality requires the following environment variables:

```
VERCEL_API_TOKEN=your-vercel-api-token
VERCEL_TEAM_ID=your-vercel-team-id
```

You can obtain these values from your Vercel account settings.

## Technical Details

The subdomain setup process works as follows:

1. The system creates a CNAME record for the subdomain pointing to `cname.vercel-dns.com`
2. The system configures the Vercel project to handle requests for the subdomain
3. The system uses the Vercel API to manage DNS records and domain configurations

The implementation can be found in the following files:

- `lib/subdomain-setup.ts`: Main functionality for setting up subdomains
- `lib/vercel-dns.ts`: Functions for interacting with the Vercel DNS API
- `app/api/setup-subdomain/route.ts`: API endpoint for manually triggering subdomain setup
- `components/setup-subdomain-button.tsx`: UI component for triggering subdomain setup 