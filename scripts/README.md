# Titan 2.0 Scripts

This directory contains utility scripts for managing the Titan 2.0 platform.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure you have a `.env.local` file in the root directory with the following variables:
   ```
   VERCEL_API_TOKEN=your-vercel-api-token
   VERCEL_TEAM_ID=your-vercel-team-id
   ```

## Available Scripts

### Check Vercel Credentials

Checks if your Vercel API token and team ID are valid and working correctly.

```
npm run check-vercel
```

### Test Subdomain Setup

Tests the subdomain setup process by creating a test subdomain.

```
npm run test-subdomain
```

### Delete DNS Record

Deletes a DNS record for a specific subdomain.

```
npm run delete-dns <subdomain>
```

Example:
```
npm run delete-dns mystore
```

### Check Subdomain Availability

Checks if a subdomain is available for use.

```
npm run check-subdomain <subdomain>
```

Example:
```
npm run check-subdomain mystore
```

## Troubleshooting

If you encounter issues with the scripts, check the following:

1. Make sure your `.env.local` file contains valid Vercel API token and team ID.
2. Ensure you have the necessary permissions to manage DNS records for the domain.
3. Check the Vercel API documentation for any changes to the API endpoints.

## Adding New Scripts

To add a new script:

1. Create a new JavaScript file in the scripts directory.
2. Add the script to the `scripts` section in `package.json`.
3. Document the script in this README file. 