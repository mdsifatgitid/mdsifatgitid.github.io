const CACHE_NAME = 'bangla-toolbox-v3'; // ভার্সন v3 রাখা হয়েছে
const urlsToCache = [
    './', 
    './index.html', 
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js',
    'https://cdn.jsdelivr.net/gh/mdsifatgitid/mdsifatgitid.github.io/SUTONNYMJ.TTF',
    'https://cdn.jsdelivr.net/gh/mdsifatgitid/mdsifatgitid.github.io/Bornomala-Regular.ttf',
    // Firebase স্ক্রিপ্টগুলো
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js'
];

// ইনস্টল ইভেন্ট: ফাইলগুলো প্রাথমিকভাবে ক্যাশ করা হবে
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return Promise.all(
                    urlsToCache.map(url => {
                        return cache.add(url).catch(err => {
                            console.log('Failed to cache:', url, err);
                        });
                    })
                );
            })
    );
    self.skipWaiting();
});

// ফেচ ইভেন্ট: সব রিকোয়েস্টের জন্য Network First স্ট্র্যাটেজি
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // নেটওয়ার্ক থাকলে সেখান থেকেই ডেটা নেবে এবং ক্যাশ আপডেট করে রাখবে
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // শুধুমাত্র নেটওয়ার্ক না থাকলে (অফলাইন) ক্যাশ থেকে লোড করবে
                return caches.match(event.request);
            })
    );
});

// অ্যাক্টিভেট ইভেন্ট: পুরনো ক্যাশ পরিষ্কার করা
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});
