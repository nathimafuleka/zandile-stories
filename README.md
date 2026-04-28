# Author Portfolio Website

A professional, modern author portfolio website built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Features smooth animations, responsive design, and optimized for cPanel hosting.

## Features

- ✨ Modern, professional design with gradient effects
- 🎨 Smooth animations using Framer Motion
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast performance with Next.js
- 🎯 SEO optimized
- 🚀 Easy to deploy on cPanel
- 💅 Styled with Tailwind CSS
- 🔧 Built with TypeScript for type safety

## Sections

1. **Hero** - Eye-catching introduction with animated elements
2. **About** - Author biography and achievements
3. **Books** - Showcase of published works with ratings
4. **Contact** - Contact form and information
5. **Footer** - Social links and newsletter signup

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

To build the static site for cPanel hosting:

```bash
npm run build
```

This will create an `out` folder with all static files ready for deployment.

## Deploying to cPanel

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload files:**
   - Connect to your cPanel File Manager or use FTP
   - Navigate to `public_html` (or your domain's root directory)
   - Upload all files from the `out` folder
   - Upload the `.htaccess` file (important for routing)

3. **Set permissions:**
   - Ensure files have proper permissions (644 for files, 755 for directories)

4. **Access your site:**
   - Visit your domain to see the live website

## Customization

### Update Author Information

Edit the following files to customize content:

- `components/Hero.tsx` - Main headline and introduction
- `components/About.tsx` - Biography and statistics
- `components/Books.tsx` - Book listings and details
- `components/Contact.tsx` - Contact information
- `components/Footer.tsx` - Social links and footer content

### Change Colors

Edit `tailwind.config.js` to modify the color scheme:

```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Modify Animations

Animations are configured in individual components using Framer Motion. Look for `motion` components and adjust their properties.

## Technologies Used

- **Next.js 14** - React framework with static export
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The site is optimized for performance with:
- Static site generation
- Optimized images
- Minimal JavaScript bundle
- CSS purging
- Gzip compression (via .htaccess)

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please contact the developer or create an issue in the repository.

---

Built with ❤️ for authors worldwide
