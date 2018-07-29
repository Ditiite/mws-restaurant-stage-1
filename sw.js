const KEY_NS = 'restaurant-cache';
const VER = 'v1';
const CACHE_KEY = `${KEY_NS}-${VER}`;

self.addEventListener('install', (event) => {
    // Cache main resources
    const cacheResources = [
        // Html
        '/',
        '/restaurant.html',
        // Styles
        '/css/styles.css',
        // Scripts
        '/js/main.js',
        '/js/dbhelper.js',
        '/js/restaurant_info.js',
        // 3rd party
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
    ];
    event.waitUntil(
        caches.open(CACHE_KEY).then((cache) => {
            return cache.addAll(
                cacheResources
            ).catch((err) => {
                console.error(err);
            });
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_KEY)
        .then((cache) => {
            return cache.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(event.request).then((resp) => {
                        // Cache all dynamic responses
                        cache.put(event.request, resp.clone());
                        return resp;
                    });
                });
        })
        .catch((err) => {
            console.error(`Error opening cache ${CACHE_KEY}`, err);
        })
    )
});

self.addEventListener('activate', (event) => {
    caches.keys().then((keys) => {
        keys.forEach((key) => {
            if (key.startsWith(KEY_NS) && key !== CACHE_KEY) {
                caches.delete(key).then(() => {
                    console.log(`Removed unused key ${key}`);
                });
            }
        });
    });
});
