# cPanel Deployment Guide

This guide will walk you through deploying your author portfolio website to cPanel hosting.

## Prerequisites

- Node.js installed on your local machine
- Access to cPanel hosting account
- FTP client (FileZilla, Cyberduck) or cPanel File Manager access
- Your domain configured in cPanel

## Step-by-Step Deployment

### 1. Build the Website

On your local machine, navigate to the project directory and run:

```bash
# Install dependencies (if not already done)
npm install

# Build the static site
npm run build
```

This creates an `out` folder containing all static files.

### 2. Prepare Files for Upload

The `out` folder contains:
- `index.html` - Main page
- `_next/` - Next.js assets (CSS, JS, images)
- Other HTML files for routing

**Important:** Also include the `.htaccess` file from the project root.

### 3. Upload to cPanel

#### Option A: Using cPanel File Manager

1. Log in to your cPanel account
2. Navigate to **File Manager**
3. Go to `public_html` (or your domain's directory)
4. **Delete or backup** existing files in the directory
5. Click **Upload** and select all files from the `out` folder
6. Upload the `.htaccess` file to the same directory
7. Wait for upload to complete

#### Option B: Using FTP Client

1. Open your FTP client (e.g., FileZilla)
2. Connect using your cPanel FTP credentials:
   - Host: `ftp.yourdomain.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21
3. Navigate to `public_html` on the remote server
4. Upload all files from the `out` folder
5. Upload the `.htaccess` file

### 4. Set File Permissions

Ensure proper permissions are set:
- **Files**: 644
- **Directories**: 755

In cPanel File Manager:
1. Select all files
2. Click **Permissions**
3. Set to 644 for files, 755 for folders

### 5. Configure Domain (if needed)

If deploying to a subdomain or addon domain:

1. In cPanel, go to **Domains** or **Addon Domains**
2. Ensure your domain points to the correct directory
3. Update DNS if necessary

### 6. Test Your Website

1. Visit your domain in a web browser
2. Test all sections (Home, About, Books, Contact)
3. Check mobile responsiveness
4. Verify animations work correctly
5. Test the contact form

## Troubleshooting

### Issue: 404 Errors on Page Refresh

**Solution:** Ensure `.htaccess` file is uploaded and contains proper rewrite rules.

### Issue: Styles Not Loading

**Solution:** 
- Check that `_next` folder is uploaded
- Verify file permissions (644 for files)
- Clear browser cache

### Issue: Images Not Displaying

**Solution:**
- Ensure all image files are uploaded
- Check file paths are correct
- Verify image file permissions

### Issue: Slow Loading

**Solution:**
- Enable Gzip compression (included in `.htaccess`)
- Use cPanel's optimization tools
- Consider enabling CDN

## Updating Your Website

To update content:

1. Make changes locally
2. Run `npm run build`
3. Upload only changed files from the `out` folder
4. Clear browser cache to see changes

## Performance Optimization

### Enable Caching

The `.htaccess` file includes caching rules. Verify it's working:
- Check browser developer tools → Network tab
- Look for cache headers

### Enable HTTPS

1. In cPanel, go to **SSL/TLS Status**
2. Enable AutoSSL or install Let's Encrypt certificate
3. Uncomment HTTPS redirect in `.htaccess`:

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Optimize Images

Before building:
- Compress images using tools like TinyPNG
- Use appropriate image formats (WebP when possible)
- Resize images to actual display size

## Backup

Always backup before updating:

1. In cPanel File Manager, select `public_html`
2. Click **Compress**
3. Download the archive
4. Store safely

## Domain Configuration

### Main Domain
Upload to: `public_html/`

### Subdomain
1. Create subdomain in cPanel
2. Upload to: `public_html/subdomain/`

### Addon Domain
1. Add domain in cPanel
2. Upload to the specified directory

## Security

- Keep `.env` files out of the `out` folder
- Don't upload `node_modules`
- Regularly update dependencies
- Use HTTPS
- Set proper file permissions

## Support Resources

- cPanel Documentation: Check your host's knowledge base
- Next.js Static Export: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- Contact your hosting provider for server-specific issues

---

**Congratulations!** Your author portfolio is now live on cPanel hosting.
