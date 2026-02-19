# PWA Deployment Guide

## Quick Start

Your Next.js app is now PWA-ready! Follow these steps to deploy:

### 1. Generate Icons

Open `frontend/scripts/generate-icons.html` in your browser to generate placeholder icons, or create your own:

```bash
# Option 1: Use the HTML generator
# Open frontend/scripts/generate-icons.html in browser
# Download all icons and place in frontend/public/icons/

# Option 2: Use your own 512x512 logo
# Follow instructions in PWA_SETUP.md
```

### 2. Build for Production

```bash
cd frontend
npm run build
```

This will:
- Generate service worker files
- Optimize assets
- Create production build

### 3. Test Locally

```bash
npm start
```

Then:
1. Open http://localhost:3000
2. Open Chrome DevTools > Application tab
3. Check Manifest and Service Workers
4. Test install prompt
5. Test offline mode

### 4. Deploy

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Custom Server
```bash
npm run build
npm start
# Or use PM2:
pm2 start npm --name "nomadnotes" -- start
```

## HTTPS Requirement

⚠️ **IMPORTANT**: PWAs require HTTPS to work. Make sure your deployment platform provides SSL certificates.

Most platforms (Vercel, Netlify, etc.) provide automatic HTTPS.

## Post-Deployment Checklist

- [ ] Test on Android Chrome
- [ ] Test on iOS Safari
- [ ] Test on Desktop Chrome/Edge
- [ ] Verify install prompt appears
- [ ] Test offline functionality
- [ ] Check service worker updates
- [ ] Run Lighthouse PWA audit (aim for 100%)
- [ ] Test push notifications (if implemented)
- [ ] Verify app shortcuts work
- [ ] Check manifest.json is accessible at /manifest.json

## Platform-Specific Notes

### Android
- Install prompt appears automatically after engagement criteria
- Can be added to home screen
- Supports app shortcuts
- Full offline support

### iOS
- Manual installation via Share > Add to Home Screen
- Limited service worker support
- No install prompt
- Some PWA features may be limited

### Desktop
- Install button in address bar
- Runs in standalone window
- Full PWA feature support
- Can be pinned to taskbar/dock

## Monitoring

### Check Service Worker Status
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### Check Cache
```javascript
// In browser console
caches.keys().then(keys => {
  console.log('Cache Keys:', keys);
});
```

### Force Update
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.update());
});
```

## Troubleshooting

### Service Worker Not Registering
1. Ensure HTTPS is enabled
2. Check browser console for errors
3. Verify next.config.ts PWA settings
4. Clear browser cache and reload

### Install Prompt Not Showing
1. Check engagement criteria (30 seconds on site)
2. Verify manifest.json is valid
3. Ensure all required icons exist
4. Check browser compatibility

### Offline Mode Not Working
1. Verify service worker is active
2. Check caching strategies in next.config.ts
3. Test with DevTools offline mode
4. Check network requests in DevTools

### Updates Not Applying
1. Service workers cache aggressively
2. Use skipWaiting: true in config
3. Force refresh (Ctrl+Shift+R)
4. Unregister old service worker

## Performance Tips

1. **Optimize Images**: Use WebP format and proper sizing
2. **Lazy Load**: Implement lazy loading for images and components
3. **Code Splitting**: Next.js does this automatically
4. **Cache Strategy**: Adjust based on your needs
5. **Preload Critical Assets**: Use link rel="preload"

## Security

1. **HTTPS Only**: Never deploy PWA without HTTPS
2. **Content Security Policy**: Add CSP headers
3. **Validate Inputs**: Always sanitize user inputs
4. **Secure API Calls**: Use authentication tokens
5. **Update Dependencies**: Keep packages up to date

## Analytics

Track PWA-specific metrics:
- Install rate
- Standalone usage
- Offline usage
- Service worker errors
- Cache hit rate

## Support

For issues:
1. Check browser console
2. Review Application tab in DevTools
3. Test in incognito mode
4. Check service worker logs
5. Verify manifest.json format

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Next.js PWA](https://github.com/shadowwalker/next-pwa)
- [Can I Use PWA](https://caniuse.com/serviceworkers)
