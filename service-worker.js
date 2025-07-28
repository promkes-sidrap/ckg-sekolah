// service-worker.js

const CACHE_NAME = 'skrining-kesehatan-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css', /* Pastikan ini ada jika Anda memisahkannya */
    '/script.js',
    'https://cdn.tailwindcss.com', /* Cache Tailwind CSS CDN */
    // Tambahkan aset lain seperti gambar, font, dll. jika ada
];

// Event 'install' terjadi saat Service Worker pertama kali diinstal
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache dibuka');
                return cache.addAll(urlsToCache); // Menambahkan semua aset ke cache
            })
    );
});

// Event 'fetch' mencegat permintaan jaringan
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Jika ada di cache, kembalikan respons dari cache
                if (response) {
                    return response;
                }
                // Jika tidak ada di cache, lakukan permintaan jaringan
                return fetch(event.request).then(
                    (response) => {
                        // Periksa apakah kita menerima respons yang valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // PENTING: Kloning respons. Respons adalah stream
                        // dan hanya dapat dikonsumsi sekali. Kita harus mengkloningnya agar
                        // kita dapat mengonsumsi satu di cache dan satu di browser.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache); // Simpan respons ke cache
                            });

                        return response;
                    }
                );
            })
    );
});

// Event 'activate' terjadi saat Service Worker diaktifkan
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Hapus cache lama yang tidak ada dalam daftar putih
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
