# Deployment Setup Guide

This guide helps you set up automatic deployment from GitHub to Namecheap hosting.

## Prerequisites

1. A Namecheap hosting account with FTP access
2. A GitHub repository for your pizza club website
3. Admin access to the GitHub repository

## Step 1: Gather Namecheap FTP Credentials

1. Log into your Namecheap account
2. Go to **Dashboard** → **Hosting List** → **Manage** (for your domain)
3. Find the **FTP Accounts** section
4. Note down:
   - **FTP Server**: Usually something like `ftp.yourdomain.com`
   - **FTP Username**: Your FTP username
   - **FTP Password**: Your FTP password
   - **Directory**: Usually `/public_html` or `/public_html/pizza-club`

## Step 2: Set Up GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (in the repository, not your profile)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each of these:

### Required Secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `FTP_SERVER` | Your FTP server address | `ftp.greaterpizzaclub.com` |
| `FTP_USERNAME` | Your FTP username | `pizzaclub@greaterpizzaclub.com` |
| `FTP_PASSWORD` | Your FTP password | `your-secure-password` |
| `FTP_SERVER_DIR` | Target directory on server | `/public_html/` or `/public_html/pizza/` |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | `AIzaSyA...` |

## Step 3: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Maps JavaScript API**
4. Create credentials → API Key
5. Restrict the key:
   - **Application restrictions**: HTTP referrers
   - Add your domain: `https://yourdomain.com/*`
   - Add localhost for development: `http://localhost:*`

## Step 4: Configure Your Domain

If deploying to a subdirectory (e.g., `greaterpizzaclub.com/pizza/`):

1. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/pizza/',  // Add this line
  // ... rest of config
})
```

2. Update the FTP_SERVER_DIR secret to match

## Step 5: Test Deployment

1. Make a small change to any file in `pizza-club-site/`
2. Commit and push to main branch
3. Go to **Actions** tab in GitHub
4. Watch the deployment workflow run
5. Check your website after ~5 minutes

## Troubleshooting

### FTP Connection Failed
- Verify FTP credentials in Namecheap
- Check if your hosting requires SFTP instead of FTP
- Ensure FTP account has write permissions

### Build Errors
- Check the Actions log for specific errors
- Ensure all npm packages are in package.json
- Verify Node version matches your local environment

### Files Not Appearing
- Check FTP_SERVER_DIR is correct
- Verify the domain points to the right directory
- Clear browser cache

### Maps Not Working
- Verify API key is correct in GitHub secrets
- Check API key restrictions in Google Cloud Console
- Ensure billing is enabled for your Google Cloud project

## Manual Deployment (Backup Option)

If GitHub Actions fails:

1. Build locally:
```bash
cd pizza-club-site
npm install
npm run build
```

2. Upload the `dist/` folder contents to your hosting via:
   - Namecheap File Manager
   - FTP client (FileZilla, Cyberduck)
   - cPanel File Manager

## Security Notes

- Never commit API keys or passwords to the repository
- Use GitHub Secrets for all sensitive information
- Regularly rotate FTP passwords
- Monitor your Google Maps API usage to avoid unexpected charges

## Need Help?

- Check the [GitHub Actions log](../../actions) for detailed error messages
- Verify all secrets are set correctly (they won't show values for security)
- Ensure your Namecheap hosting supports Node.js applications
- Contact Namecheap support for FTP issues