const CACHE_NAME = 'bangla-toolbox-v17';
const urlsToCache = [
    './', 
    './index.html', 
    './manifest.json',
    // ২. নিচে Tailwind এর পুরনো লিংক সরিয়ে  নতুন গিটহাব লিংক বসানো হয়েছে
    'https://cdn.jsdelivr.net/gh/mdsifatgitid/mdsifatgitid.github.io@main/tailwind.js',
    
    // বাকি লাইব্রেরিগুলো আগের মতোই আছে
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',

    // ফন্টসমূহ ক্যাশ করা হলো
    'https://cdn.jsdelivr.net/gh/mdsifatgitid/mdsifatgitid.github.io/Bornomala-Regular.ttf',
    'https://cdn.jsdelivr.net/gh/mdsifatgitid/mdsifatgitid.github.io/SUTONNYMJ.TTF'
];

// ১. ইনস্টল ইভেন্ট: ফাইলগুলো ক্যাশ করা হবে
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Promise.allSettled ব্যবহার করা হয়েছে যাতে একটি ফেইল করলেও বাকিগুলো ক্যাশ হয় এবং ইনস্টল ফেইল না করে
            return Promise.allSettled(
                urlsToCache.map(url => {
                    return cache.add(url).catch(err => {
                        // সাইলেন্টলি ফেইল করবে, কনসোলে এরর দেখাবে না
                        // console.log('Skipped caching:', url);
                    });
                })
            );
        })
    );
});

// ২. ফেচ ইভেন্ট: আপনার চাহিদা অনুযায়ী লজিক
self.addEventListener('fetch', event => {
    // শুধুমাত্র GET রিকোয়েস্ট হ্যান্ডেল করবে
    if (event.request.method !== 'GET') return;

    // আপনার শর্ত: "যতক্ষণ অনলাইন থাকবে ততক্ষণ pwa স্ক্রিপ্ট কোনো ভাবেই কাজ করবেনা"
    // এর মানে হলো, অনলাইনে থাকলে সরাসরি ব্রাউজার নেটওয়ার্ক ব্যবহার করবে, সার্ভিস ওয়ার্কার ইন্টারফেয়ার করবে না।
    if (navigator.onLine) {
        return; // অনলাইনে থাকলে কিছুই করব না, ব্রাউজার ডিফল্ট আচরণ করবে
    }

    // অফলাইনে থাকলে ক্যাশ থেকে দেওয়ার চেষ্টা করবে
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // ক্যাশে না থাকলে এবং অফলাইন হলে কাস্টম অফলাইন পেজ বা এরর রিটার্ন করা যেতে পারে
                return new Response("You are offline and this resource is not cached.", { 
                    status: 503, 
                    statusText: "Offline" 
                });
            })
    );
});

// ৩. অ্যাক্টিভেট ইভেন্ট: পুরনো ক্যাশ মুছে ফেলা
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
        }).then(() => {
            return self.clients.claim();
        })
    );
});
