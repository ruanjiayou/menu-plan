import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/menu-plan',
  plugins: [react()],
  build: {
    outDir: 'menu-plan'
  },
  server: {
    port: 3060,
    proxy: {
      '/gw/menu-plan': {
        target: 'http://jiayou.work', // 后端接口地址
        changeOrigin: true, // 允许跨域
      }
    }
  }
});