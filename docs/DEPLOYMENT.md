# Deployment Guide

## Web Deployment

The Room is a pure client-side web application and can be deployed to any static hosting service.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

#### GitHub Pages

1. Build the project: `npm run build`
2. Push `dist/` contents to `gh-pages` branch or `docs/` folder
3. Enable GitHub Pages in repository settings
4. Site will be available at `https://yourusername.github.io/TheRoom`

**Using GitHub Actions:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Or connect GitHub repository and set build command: `npm run build`
4. Set publish directory: `dist`

**netlify.toml:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Build the project: `npm run build`
3. Deploy: `vercel --prod`

Or connect GitHub repository in Vercel dashboard.

**vercel.json:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Cloudflare Pages

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Deploy

#### Traditional Web Hosting

1. Build the project: `npm run build`
2. Upload contents of `dist/` folder to your web server
3. Ensure server is configured for SPA routing (redirect all routes to `index.html`)

### SPA Routing Configuration

For client-side routing to work, configure your server to serve `index.html` for all routes:

**Apache (.htaccess):**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Electron Deployment

### Building Electron App

```bash
# Build web assets
npm run build

# Build Electron app
npm run dist
```

Built applications will be in `dist/` directory.

### Platform-Specific Builds

#### macOS

```bash
npm run dist -- --mac
```

Creates:
- `.dmg` installer
- `.app` bundle

#### Windows

```bash
npm run dist -- --win
```

Creates:
- `.exe` installer (NSIS)
- Portable version

#### Linux

```bash
npm run dist -- --linux
```

Creates:
- `.AppImage`
- `.deb` package
- `.rpm` package

### Code Signing

#### macOS

1. Get Apple Developer certificate
2. Configure in `package.json`:

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name"
    }
  }
}
```

#### Windows

1. Get code signing certificate
2. Configure in `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "password"
    }
  }
}
```

### Auto-Updates

For auto-updates, consider using:

- [electron-updater](https://www.electron.build/auto-update)
- [electron-builder auto-update](https://www.electron.build/auto-update)

## CI/CD

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run dist
      - uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist/
```

## Environment Variables

For different environments, use environment variables:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7878';
```

Access in code: `import.meta.env.VITE_*`

## Performance Optimization

### Build Optimizations

- Code splitting
- Tree shaking
- Minification
- Compression (gzip/brotli)

### Runtime Optimizations

- Lazy loading scenes
- Object pooling
- Level of detail (LOD)
- Frustum culling

## Monitoring

### Error Tracking

Consider integrating:

- Sentry
- LogRocket
- Rollbar

### Analytics

- Google Analytics
- Plausible Analytics
- Custom analytics

## Security Considerations

### Content Security Policy

Add CSP headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

### HTTPS

Always use HTTPS in production.

### Dependency Updates

Regularly update dependencies:

```bash
npm audit
npm update
```

## Troubleshooting

### Build Fails

- Check Node.js version (v18+)
- Clear `node_modules` and reinstall
- Check for syntax errors

### Routing Doesn't Work

- Ensure server is configured for SPA routing
- Check base path in `vite.config.js`

### Electron Build Fails

- Check platform-specific requirements
- Verify code signing certificates
- Check build logs for errors

## Checklist

Before deploying:

- [ ] Build succeeds without errors
- [ ] All features work in production build
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile responsive (if applicable)
- [ ] Cross-browser tested
- [ ] HTTPS configured
- [ ] Analytics/error tracking configured
- [ ] Documentation updated

