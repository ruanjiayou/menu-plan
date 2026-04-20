/* eslint-disable no-restricted-globals */
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';

// ⏱️ 预缓存构建时的资源
precacheAndRoute(self.__WB_MANIFEST);

// 📁 缓存静态资源（CSS、JS、图片等）
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 144,
      })
    ]
  })
);

// 🌐 缓存 API 接口
registerRoute(
  ({ url }) => url.pathname.startsWith('/gw/menu-plan'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
  })
);
