const CACHE_NAME = 'bangla-toolbox-v6'; // ভার্সন পরিবর্তন করে v6 করা হয়েছে
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

// ১. ইনস্টল ইভেন্ট: ফাইলগুলো ক্যাশ করা হবে
self.addEventListener('install', event => {
    // নতুন সার্ভিস ওয়ার্কার ইনস্টল হওয়ার সাথে সাথে অ্যাক্টিভ করার জন্য
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache v5');
                return Promise.all(
                    urlsToCache.map(url => {
                        return cache.add(url).catch(err => {
                            console.log('Failed to cache:', url, err);
                        });
                    })
                );
            })
    );
});

// ২. ফেচ ইভেন্ট: সব রিকোয়েস্টের জন্য Network First স্ট্র্যাটেজি
// এটি প্রথমে নেটওয়ার্ক থেকে নতুন ফাইল আনার চেষ্টা করবে, ব্যর্থ হলে ক্যাশ দেখাবে।
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // নেটওয়ার্ক থেকে সফলভাবে ডেটা পেলে ক্যাশ আপডেট করুন
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // নেটওয়ার্ক না থাকলে ক্যাশ থেকে লোড করুন
                return caches.match(event.request);
            })
    );
});

// ৩. অ্যাক্টিভেট ইভেন্ট: পুরনো ক্যাশ (v1, v2, v3, v4...) মুছে ফেলা
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // ক্লায়েন্টদের (ব্রাউজার ট্যাব) নিয়ন্ত্রণ নিন
            return self.clients.claim();
        })
    );
});
