# Specification

## Summary
**Goal:** Convert the Global Nexus frontend into a Progressive Web App (PWA) so users can install it on their home screen and use it offline.

**Planned changes:**
- Create `frontend/public/manifest.json` with Global Nexus branding (name, short_name, theme color `#1A6FBF`, background `#1a1a1a`, standalone display, and icon references)
- Update `frontend/index.html` to add all required PWA meta tags (manifest link, theme-color, apple-touch-icon, mobile-web-app-capable, msapplication tile, etc.) and register the service worker via an inline script
- Create `frontend/public/sw.js` with a cache-first strategy for static assets and a network-first strategy for API/ICP canister calls, including install, fetch, and activate handlers
- Place PWA icon PNGs at `frontend/public/assets/icons/icon-192x192.png` and `frontend/public/assets/icons/icon-512x512.png`
- Add a dismissible in-app install prompt banner (fixed bottom, `#1A6FBF` background, white text) that listens for `beforeinstallprompt`, triggers the native install prompt on click, and stores dismissal state in localStorage; also show a small "Add to Home Screen" button in the top nav on mobile

**User-visible outcome:** Users on Android/iOS can install Global Nexus to their home screen via a native install prompt and use the app shell offline; the app passes Lighthouse PWA installability checks.
