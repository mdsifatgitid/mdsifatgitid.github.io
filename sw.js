const CACHE_NAME = 'bangla-toolbox-v3'; // ভার্সন v2 থেকে v3 করা হয়েছে যাতে ব্রাউজার নতুন আপডেটটি ধরে
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

// ইনস্টল ইভেন্ট
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

// ফেচ ইভেন্ট: (আপডেট করা হয়েছে)
self.addEventListener('fetch', event => {
    // ১. যদি রিকোয়েস্টটি HTML পেজের জন্য হয় (যেমন index.html), তবে আগে নেটওয়ার্ক চেক করবে
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        // নতুন ভার্সনটি ক্যাশে আপডেট করে রাখবো
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    // ইন্টারনেট না থাকলে ক্যাশ থেকে পুরনো পেজ দেখাবে
                    return caches.match(event.request);
                })
        );
    } else {
        // ২. অন্যান্য ফাইল (ইমেজ, সিএসএস, জেএস) এর জন্য আগের মতোই ক্যাশ থেকে লোড হবে (দ্রুত লোডিংয়ের জন্য)
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request);
                })
        );
    }
});

// অ্যাক্টিভেট ইভেন্ট: পুরনো ক্যাশ পরিষ্কার করা এবং নতুন সার্ভিস ওয়ার্কার সক্রিয় করা
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
    return self.clients.claim(); // পেজ রিফ্রেশ ছাড়াই নতুন সার্ভিস ওয়ার্কারকে নিয়ন্ত্রণ নিতে বলা
});
