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

const stripVaryHeaderPlugin = {
  // 在响应存入缓存前调用
  cacheWillUpdate: async ({ response }) => {
    if (response && response.headers.get('Vary') === '*') {
      const newHeaders = new Headers(response.headers);
      newHeaders.delete('Vary');

      // 返回一个全新的响应副本供缓存使用
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    return response;
  }
};

// 🌐 缓存 API 接口
registerRoute(
  ({ url }) => url.pathname.startsWith('/gw/menu-plan'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [stripVaryHeaderPlugin]
  })
);
