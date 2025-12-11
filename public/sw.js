// This is a placeholder service worker to prevent 404 errors.
// It does not perform any caching or offline functionality.

self.addEventListener('install', (event) => {
    console.log('Service Worker placeholder installed.');
});

self.addEventListener('fetch', (event) => {
    // Do nothing, let the browser handle the request.
});
