const CACHE_NAME = 'stellarush-v7';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/css/app/layout.css',
  '/_next/static/css/app/page.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('STELLARUSH Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('STELLARUSH Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('STELLARUSH Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('STELLARUSH Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('STELLARUSH Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('STELLARUSH Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('STELLARUSH Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('STELLARUSH Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        console.log('STELLARUSH Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses for future use
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('STELLARUSH Service Worker: Network fetch failed', error);

            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }

            throw error;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('STELLARUSH Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'stellarush-sync') {
    event.waitUntil(
      // Handle offline game actions when connection is restored
      syncOfflineActions()
    );
  }
});

// Push notifications (for future game alerts)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New game started!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'stellarush-notification',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'STELLARUSH',
      options
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('STELLARUSH Service Worker: Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Helper function for syncing offline actions
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or localStorage
    const offlineActions = await getOfflineActions();

    for (const action of offlineActions) {
      try {
        // Sync each action with the server
        await syncAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('STELLARUSH Service Worker: Failed to sync action', action, error);
      }
    }
  } catch (error) {
    console.error('STELLARUSH Service Worker: Sync failed', error);
  }
}

// Placeholder functions for offline data management
async function getOfflineActions() {
  // TODO: Implement IndexedDB storage for offline actions
  return [];
}

async function syncAction(action) {
  // TODO: Implement server sync for specific actions
  console.log('STELLARUSH Service Worker: Syncing action', action);
}

async function removeOfflineAction(actionId) {
  // TODO: Remove action from offline storage
  console.log('STELLARUSH Service Worker: Removing offline action', actionId);
}
