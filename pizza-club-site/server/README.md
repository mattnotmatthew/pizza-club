# Server Files for Photo Upload

This directory contains PHP files for handling photo uploads on shared hosting (like Namecheap).

## What's Included

- **`upload.php`** - PHP script that handles image uploads
- **`.htaccess`** - Security configuration for the uploads directory
- **`SETUP_INSTRUCTIONS.md`** - Detailed setup guide

## Important Notes

1. **This is NOT a Node.js server** - These are PHP files for Apache/PHP shared hosting
2. **Deploy to your existing hosting** - Upload these to your Namecheap (or similar) hosting account
3. **Separate from React app** - Your React app can be hosted anywhere (Vercel, Netlify, etc.)

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   React App         │         │  Namecheap Hosting   │
│  (Vercel/Netlify)   │ ──────> │  (PHP/Apache)        │
│                     │  HTTPS  │                      │
│ - Runs your site    │         │ - Stores images      │
│ - Sends images      │         │ - Runs upload.php    │
└─────────────────────┘         └──────────────────────┘
```

## Quick Setup

1. **Upload to Namecheap** (choose a directory name that doesn't conflict):
   ```
   upload.php → public_html/pizza-upload/upload.php
   .htaccess → public_html/images/infographics/.htaccess
   ```
   
   **Alternative directory names if needed:**
   - `public_html/pizza-api/upload.php`
   - `public_html/upload-service/upload.php`
   - `public_html/photo-upload/upload.php`

2. **Configure upload.php**:
   - Set your domain for CORS
   - Set your secret token

3. **Configure React app**:
   ```env
   VITE_UPLOAD_API_URL=https://yourdomain.com/pizza-upload/upload.php
   VITE_UPLOAD_API_TOKEN=your-secret-token
   ```

See `SETUP_INSTRUCTIONS.md` for detailed steps.

## Deployment Notes for GitHub Actions

If you're using GitHub Actions for deployment:

1. **Update deployment path** in your workflow:
   ```yaml
   server-dir: /public_html/pizza/  # Changed from /ncsitebuilder/
   ```

2. **Keep upload handler separate**:
   - Upload handler stays at `/public_html/pizza-upload/`
   - React app deploys to `/public_html/pizza/`
   - Images stored in `/public_html/images/`

3. **See deployment guide**:
   - Check `../docs/deployment-guide.md` for complete GitHub Actions setup
   - Includes rollback procedures and troubleshooting

4. **Directory structure after deployment**:
   ```
   public_html/
   ├── .htaccess (points to /pizza/)
   ├── pizza/ (your React app)
   ├── pizza-upload/ (PHP upload handler)
   └── images/ (uploaded photos)
   ```