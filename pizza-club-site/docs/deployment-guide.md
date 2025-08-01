# Deployment Guide: Switching from /ncsitebuilder to /pizza

This guide explains how to deploy your Pizza Club site to the `/pizza` directory on your Namecheap hosting using GitHub Actions.

## Overview

Your current setup:
- Domain: http://myclub.com → `/public_html/ncsitebuilder/`
- New setup: http://myclub.com → `/public_html/pizza/`
- Deployment: GitHub Actions (automatic on push)

## Prerequisites

- GitHub repository with your Pizza Club site
- GitHub Actions already configured for deployment
- FTP/SSH access to your Namecheap hosting
- Build process that creates production files

## Step 1: Update .htaccess in /public_html

Replace the current `.htaccess` file in `/public_html/` with the provided `htaccess-pizza` file:

```bash
# Current line (around line 48):
RewriteRule ^(.*)$ ncsitebuilder/$1 [L,QSA]

# Change to:
RewriteRule ^(.*)$ pizza/$1 [L,QSA]
```

**Method 1: Manual Update**
1. Connect via FTP/cPanel File Manager
2. Navigate to `/public_html/`
3. Backup current `.htaccess` as `.htaccess.backup`
4. Replace with contents of `htaccess-pizza`

**Method 2: Via GitHub Actions**
If your workflow has access to the root directory, it can copy the file automatically.

## Step 2: Create /pizza Directory

Create the new directory structure on your hosting:

```
public_html/
├── .htaccess (updated to point to /pizza)
├── pizza/              # New directory for your React app
├── pizza_api/          # NEW: PHP API backend
├── pizza_upload/       # Upload handler (already exists)
├── images/             # Uploaded images storage
└── ncsitebuilder/      # Old site (can keep for rollback)
```

## Step 3: Update GitHub Actions Workflow

Update your `.github/workflows/deploy.yml` (or similar) file:

```yaml
name: Deploy to Namecheap

on:
  push:
    branches: [ main ]  # or your default branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        VITE_UPLOAD_API_URL: ${{ secrets.VITE_UPLOAD_API_URL }}
        VITE_UPLOAD_API_TOKEN: ${{ secrets.VITE_UPLOAD_API_TOKEN }}
        VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
        VITE_GOOGLE_MAPS_ID: ${{ secrets.VITE_GOOGLE_MAPS_ID }}
    
    - name: Deploy to Namecheap
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        # IMPORTANT: Change this path from ncsitebuilder to pizza
        server-dir: /public_html/pizza/
        local-dir: ./dist/
        
    # Optional: Deploy .htaccess if needed
    - name: Deploy .htaccess
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        server-dir: /public_html/
        local-dir: ./
        include: |
          htaccess-pizza:.htaccess
```

## Step 4: Configure GitHub Secrets

Ensure these secrets are set in your GitHub repository (Settings → Secrets → Actions):

```
FTP_SERVER=your-namecheap-server.com
FTP_USERNAME=your-ftp-username
FTP_PASSWORD=your-ftp-password
VITE_API_URL=https://myclub.com/pizza_api
VITE_UPLOAD_API_URL=https://myclub.com/pizza_upload/upload.php
VITE_UPLOAD_API_TOKEN=your-secret-token
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_GOOGLE_MAPS_ID=your-map-id
```

## Step 5: Build Configuration

Ensure your `vite.config.ts` has the correct base path:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/',  // Since we're serving from domain root
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
```

## Step 6: Environment Variables

Create `.env.production` for production builds:

```env
VITE_API_URL=https://myclub.com/pizza_api
VITE_UPLOAD_API_URL=https://myclub.com/pizza_upload/upload.php
VITE_UPLOAD_API_TOKEN=your-production-token
VITE_GOOGLE_MAPS_API_KEY=your-production-key
VITE_GOOGLE_MAPS_ID=your-production-map-id
```

## Step 7: Testing Before Full Deployment

1. **Create a test subdomain** (optional):
   - Create `test.myclub.com` → `/public_html/pizza-test/`
   - Deploy there first to verify everything works

2. **Partial deployment**:
   - Deploy to `/pizza/` while keeping `/ncsitebuilder/`
   - Test by accessing `https://myclub.com/pizza/` directly
   - Only update `.htaccess` after confirming it works

## Step 8: Deployment Steps

1. **Backup current site**:
   ```bash
   # Via FTP, download entire /ncsitebuilder/ directory
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to /pizza directory"
   git push origin main
   ```

3. **Monitor GitHub Actions**:
   - Check Actions tab in GitHub
   - Verify build succeeds
   - Confirm files uploaded to `/pizza/`

4. **Update .htaccess**:
   - Upload `htaccess-pizza` as `/public_html/.htaccess`
   - Site now serves from `/pizza/`

## Step 9: Post-Deployment Verification

1. **Check site loading**:
   - Visit https://myclub.com
   - Verify all pages load correctly
   - Test navigation and routing

2. **Verify photo uploads**:
   - Test uploading a new photo
   - Confirm it saves to server (not base64)
   - Check image displays correctly

3. **Check existing features**:
   - Restaurant data loads
   - Map functionality works
   - Infographics display properly

## Rollback Plan

If issues occur, you can quickly rollback:

1. **Revert .htaccess**:
   ```apache
   # Change back to:
   RewriteRule ^(.*)$ ncsitebuilder/$1 [L,QSA]
   ```

2. **Keep both directories**:
   - `/ncsitebuilder/` - old working site
   - `/pizza/` - new site
   - Switch between them via .htaccess

## Troubleshooting

### Site shows 404 errors
- Verify `/pizza/` directory exists
- Check `.htaccess` syntax
- Ensure `index.html` is in `/pizza/`

### Assets not loading
- Check browser console for 404s
- Verify build output structure
- Check `base` in vite.config.ts

### GitHub Actions failing
- Check Actions logs for errors
- Verify FTP credentials
- Ensure build completes locally

### Images not uploading
- Verify `/pizza_upload/` is accessible
- Check CORS configuration
- Confirm environment variables are set

### API not working
- Check `/pizza_api/` is accessible
- Verify database credentials in config/Database.php
- Test API health: `https://myclub.com/pizza_api/health`
- Check CORS headers are properly set

## Directory Structure After Deployment

```
public_html/
├── .htaccess                 # Points to /pizza/
├── pizza/                    # Your React app
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── data/                # Legacy JSON files (not used)
├── pizza_api/                # PHP API backend
│   ├── index.php
│   ├── .htaccess
│   ├── core/
│   ├── config/
│   └── endpoints/
├── pizza_upload/             # PHP upload handler
│   └── upload.php
├── images/                   # Uploaded photos
│   └── infographics/
│       └── [id]/
│           └── [photo].webp
└── ncsitebuilder/           # Old site (for rollback)
```

## API Deployment

### Step 1: Database Setup

1. Create MySQL database via cPanel
2. Import schema:
   ```sql
   mysql -u username -p database_name < server/database/schema/complete-schema.sql
   ```

### Step 2: Deploy API Files

1. Upload `/server/api/` to `/public_html/pizza_api/`
2. Update database credentials in `/pizza_api/config/Database.php`
3. Set permissions:
   ```bash
   chmod 755 /public_html/pizza_api
   chmod 644 /public_html/pizza_api/.htaccess
   ```

### Step 3: Run Migration

1. Upload migration script temporarily
2. Access: `https://myclub.com/pizza_api/database/run-migration-complete.php?token=YOUR_TOKEN`
3. **DELETE migration scripts immediately after use**

### Step 4: Security Configuration

1. Generate new API token:
   ```bash
   openssl rand -hex 32
   ```

2. Update production CORS in `/pizza_api/core/BaseAPI.php`:
   ```php
   $allowedOrigins = [
       'https://greaterchicagolandpizza.club',
       'https://www.greaterchicagolandpizza.club'
   ];
   ```

3. Disable error display in `/pizza_api/index.php`:
   ```php
   ini_set('display_errors', 0);
   ```

## Maintenance Notes

1. **Regular backups**:
   - Backup MySQL database weekly
   - Backup `/images/` directory weekly
   - Keep database exports

2. **Monitor disk usage**:
   - Uploaded images accumulate over time
   - Database size grows with usage
   - Set up cleanup for old/unused images

3. **Security updates**:
   - Keep PHP version updated (8.2+)
   - Monitor for security advisories
   - Rotate API tokens periodically
   - Review access logs

4. **Performance monitoring**:
   - Check API response times
   - Monitor database query performance
   - Optimize indexes if needed

## Additional GitHub Actions Features

You can enhance your workflow with:

```yaml
# Notification on deployment
- name: Notify deployment
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment completed'
  if: always()

# Create deployment artifact
- name: Upload artifact
  uses: actions/upload-artifact@v3
  with:
    name: dist
    path: dist/

# Cache dependencies
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## Support

- **GitHub Actions**: Check [Actions documentation](https://docs.github.com/actions)
- **Namecheap**: Contact support for hosting issues
- **Build issues**: Run `npm run build` locally to debug