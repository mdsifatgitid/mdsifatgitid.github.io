const CACHE_NAME = 'bangla-toolbox-v2';
const urlsToCache = [
    './', 
    // আপনার HTML ফাইলের নাম যদি ভিন্ন হয়, তবে নিচের লাইনটি পরিবর্তন করুন
    './index.html', 
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js',
    'https://cdn.jsdelivr.net/gh/mdsifatgitid/mdsifatgitid.github.io/SUTONNYMJ.TTF',
    'https://cdn.jsdelivr.net/gh/mdsifatgitid/mdsifatgitid.github.io/Bornomala-Regular.ttf',
    // Firebase স্ক্রিপ্টগুলো ক্যাশ করা হচ্ছে যাতে অ্যাপ ক্রাশ না করে
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js'
];

// ইনস্টল ইভেন্ট: ফাইলগুলো ক্যাশে সেভ করা
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // একটি একটি করে ফাইল ক্যাশ করার চেষ্টা করবে, যাতে একটি ফেইল হলে সব বন্ধ না হয়
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

// ফেচ ইভেন্ট: অফলাইনে ক্যাশ থেকে ফাইল লোড করা
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // ক্যাশে পাওয়া গেলে সেটি রিটার্ন করবে
                if (response) {
                    return response;
                }
                // না পাওয়া গেলে নেটওয়ার্ক থেকে আনবে
                return fetch(event.request);
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
});
