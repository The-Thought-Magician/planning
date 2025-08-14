const CACHE_NAME = 'lock-in-protocol-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/calendar',
  '/workout',
  '/nutrition',
  '/milestones',
  '/progress',
  '/strategy',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  let options = {
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };

  if (event.data) {
    const notificationData = event.data.json();
    options = {
      ...options,
      ...notificationData,
      body: notificationData.message || options.body,
      tag: notificationData.tag || 'default'
    };
  }

  event.waitUntil(
    self.registration.showNotification('Lock-In Protocol', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  let clickResponsePromise = Promise.resolve();
  
  if (event.action === 'explore' || !event.action) {
    clickResponsePromise = clients.matchAll()
      .then((clientList) => {
        const client = clientList.find((c) => c.visibilityState === 'visible');
        
        if (client) {
          client.focus();
          return client;
        } else {
          return clients.openWindow('/dashboard');
        }
      });
  }

  event.waitUntil(clickResponsePromise);
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data when connection is restored
    console.log('Background sync triggered');
    // Add your background sync logic here
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  }
});

// Schedule notification function
function scheduleNotification(payload) {
  const { title, message, scheduledTime, tag, actions } = payload;
  const delay = new Date(scheduledTime).getTime() - Date.now();
  
  if (delay > 0) {
    setTimeout(() => {
      self.registration.showNotification(title, {
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: tag,
        vibrate: [100, 50, 100],
        actions: actions || [
          {
            action: 'view',
            title: 'View',
            icon: '/icons/icon-96x96.png'
          }
        ]
      });
    }, delay);
  }
}