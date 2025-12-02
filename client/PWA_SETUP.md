# PWA Setup Guide

This app is now a Progressive Web App (PWA) with offline support and native-like features!

## Features

✅ **Installable** - Can be installed on home screen (mobile & desktop)
✅ **Offline Support** - Works without internet (cached content)
✅ **Full Screen Mode** - Runs in standalone mode without browser UI
✅ **Native Feel** - Feels like a native app with proper icons and splash screens
✅ **Push Notifications** - Ready for notifications (if needed in future)
✅ **Background Sync** - Can sync data when connection is restored

## Generate Icons

### Option 1: Open the HTML Generator
1. Open `generate-icons.html` in your browser
2. Right-click each icon and save it to the `public` folder
3. Save the following sizes: 72, 96, 128, 144, 152, 192, 384, 512
4. Save the apple-touch-icon as `apple-touch-icon.png`

### Option 2: Use an Online Tool
Visit one of these sites and upload a logo (512x512 recommended):
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/favicon-converter/
- https://realfavicongenerator.net/

Generate icons for:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `apple-touch-icon.png` (180x180)

## Testing the PWA

### Test on Desktop (Chrome/Edge)
1. Run `npm run dev`
2. Open http://localhost:5173
3. Look for the install icon in the address bar
4. Click to install
5. The app should open in a standalone window

### Test on Mobile
1. Deploy the app to a server (it needs HTTPS for PWA features)
2. Visit the URL on your phone
3. Look for "Add to Home Screen" prompt
4. Install and open from home screen

### Test Offline Support
1. Open DevTools → Application → Service Workers
2. Check "Offline" mode
3. Refresh the page - it should still work!

## Deployment Notes

For PWA to work in production:
- ✅ Must be served over HTTPS
- ✅ Service worker must be registered
- ✅ Manifest.json must be accessible
- ✅ Icons must be in the correct paths

## Files Created

```
client/
├── public/
│   ├── manifest.json          # PWA configuration
│   ├── sw.js                  # Service worker for offline support
│   ├── browserconfig.xml      # Windows tile config
│   ├── offline.html           # Offline fallback page
│   ├── icon-*.png             # App icons (need to generate)
│   └── apple-touch-icon.png   # iOS icon (need to generate)
├── src/
│   ├── components/
│   │   └── InstallPrompt.jsx  # "Add to Home Screen" prompt
│   └── main.jsx               # Service worker registration
└── PWA_SETUP.md               # This file
```

## Customization

### Change Theme Color
Edit `manifest.json` and update:
```json
"theme_color": "#92400e",
"background_color": "#fffbeb"
```

### Modify App Name
Edit `manifest.json`:
```json
"name": "Your App Name",
"short_name": "Short Name"
```

### Add Shortcuts
Already included in manifest.json! Users can long-press the icon for quick actions:
- Register
- Family Tree

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Desktop & Android)
- ✅ Samsung Internet
- ⚠️ Safari (Desktop) - Limited PWA support

## Troubleshooting

### Install button not showing?
- Make sure you're on HTTPS (or localhost)
- Check that manifest.json is loading correctly
- Open DevTools → Application → Manifest to debug

### Service worker not registering?
- Check browser console for errors
- Make sure sw.js is in the public folder
- Try clearing browser cache and reloading

### Icons not displaying?
- Verify icon files are in public folder
- Check file names match manifest.json
- Ensure icons are the correct sizes

## Next Steps

1. Generate and add icon files
2. Test the PWA locally
3. Deploy to a hosting service (Vercel, Netlify, etc.)
4. Test on real mobile devices
5. Submit to app stores if desired (using PWABuilder)
