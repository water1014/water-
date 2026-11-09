/* 水色物语 · Service Worker
   网络优先：在线时优先获取最新文件；离线时回落到同源缓存。
   只缓存 GET 同源资源，不拦截 API、跨域请求与写入请求。 */
var CACHE = 'mizu-iro-v3';
var SHELL = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/icon.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(SHELL.map(function (url) {
        return cache.add(url).catch(function () {
          // 单个资源缓存失败不应阻断整个 Service Worker 安装。
          return false;
        });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key.indexOf('mizu-iro-') === 0 && key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 不把浏览器扩展、带凭据请求或非 HTTP(S) 请求纳入离线缓存。
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  event.respondWith(
    fetch(request).then(function (response) {
      if (response && response.status === 200 && response.type === 'basic') {
        var copy = response.clone();
        event.waitUntil(
          caches.open(CACHE).then(function (cache) {
            return cache.put(request, copy);
          }).catch(function () {
            // 缓存写入失败不影响本次在线响应。
          })
        );
      }
      return response;
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;

        // 只有页面导航请求才能回退到应用入口，避免 CSS/JS 被错误返回 HTML。
        if (request.mode === 'navigate') {
          return caches.match('./index.html').then(function (index) {
            return index || new Response('水色物语暂时无法连接，请检查网络后重试。', {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
          });
        }

        return new Response('此资源目前不可用，请联网后重试。', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
