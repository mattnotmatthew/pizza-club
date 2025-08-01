#!/bin/bash
# Production build script for Pizza Club Site

# Set production environment variables
export VITE_API_URL=https://greaterchicagolandpizza.club/pizza_api
export VITE_UPLOAD_API_URL=https://greaterchicagolandpizza.club/pizza_upload/upload.php
# Note: Don't include the actual token in this file - set it when running the script

# Check if token is provided
if [ -z "$VITE_UPLOAD_API_TOKEN" ]; then
    echo "Error: VITE_UPLOAD_API_TOKEN environment variable must be set"
    echo "Usage: VITE_UPLOAD_API_TOKEN=your_token ./build-production.sh"
    exit 1
fi

# Clean previous build
rm -rf dist

# Run production build
echo "Building Pizza Club Site for production..."
echo "API URL: $VITE_API_URL"
echo "Upload URL: $VITE_UPLOAD_API_URL"

npm run build

echo "Build complete! Files are in the 'dist' directory."
echo ""
echo "To deploy:"
echo "1. Upload the contents of the 'dist' directory to your server's pizza directory"
echo "2. Make sure your server has the pizza_api and pizza_upload directories set up"
echo "3. Ensure your database is configured and accessible"