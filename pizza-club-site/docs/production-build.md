# Production Build Guide

## Overview

The Pizza Club Site requires environment variables to be set at build time for production deployment. This guide explains how to properly build and deploy the application.

## Environment Variables

The following environment variables must be set during the build process:

- `VITE_API_URL` - The URL to your Pizza Club API (e.g., `https://greaterchicagolandpizza.club/pizza_api`)
- `VITE_UPLOAD_API_TOKEN` - The authentication token for API access
- `VITE_UPLOAD_API_URL` - The URL for photo uploads (optional)
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)
- `VITE_GOOGLE_MAPS_ID` - Google Maps ID (optional)

## Building for Production

### Method 1: Using the Build Script

1. Use the provided build script:
   ```bash
   VITE_UPLOAD_API_TOKEN=your_token ./build-production.sh
   ```

2. The script will:
   - Set the correct API URLs for production
   - Clean previous builds
   - Run the production build
   - Output files to the `dist` directory

### Method 2: Manual Build

1. Set environment variables:
   ```bash
   export VITE_API_URL=https://greaterchicagolandpizza.club/pizza_api
   export VITE_UPLOAD_API_URL=https://greaterchicagolandpizza.club/pizza_upload/upload.php
   export VITE_UPLOAD_API_TOKEN=your_token_here
   ```

2. Run the build:
   ```bash
   npm run build
   ```

### Method 3: Using .env File

1. Create a `.env.production` file:
   ```env
   VITE_API_URL=https://greaterchicagolandpizza.club/pizza_api
   VITE_UPLOAD_API_URL=https://greaterchicagolandpizza.club/pizza_upload/upload.php
   VITE_UPLOAD_API_TOKEN=your_token_here
   ```

2. Run the build:
   ```bash
   npm run build
   ```

## Deployment

1. After building, upload the contents of the `dist` directory to your server's `pizza` directory

2. Ensure your server structure looks like:
   ```
   public_html/
   ├── pizza/              # React app (dist contents)
   ├── pizza_api/          # PHP API backend
   ├── pizza_upload/       # Upload handler
   ```

3. Verify the API is accessible at the configured URL

## Troubleshooting

### White Screen / API URL Not Configured Error

If you see a white screen or "API URL not configured" error:

1. The build was created without the `VITE_API_URL` environment variable
2. Rebuild the application with the environment variable set
3. Redeploy the new build

### API Connection Errors

If the app loads but can't connect to the API:

1. Check that the API URL is correct in your build
2. Verify the API is deployed and accessible
3. Check CORS settings in the API's `.htaccess` file
4. Ensure the authentication token matches between frontend and backend

### Checking Build Configuration

To verify what API URL was built into your app:

1. Open the browser developer console
2. Look for any API-related console messages
3. Check network requests to see what URLs are being called

## Security Notes

- Never commit `.env` files with real tokens to version control
- Use different tokens for development and production
- Rotate tokens regularly
- Keep the `.env.example` file updated with required variables (without values)