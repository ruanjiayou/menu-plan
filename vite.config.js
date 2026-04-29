import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import wyw from '@wyw-in-js/vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const manifest = {
    name: env.APP_NAME,
    short_name: env.APP_NAME,
    description: '应用描述',
    theme_color: '#ffffff',
    background_color: "#ffffff",
    orientation: "portrait",
    start_url: `${env.APP_SCOPE}`,
    id: env.APP_NAME,
    scope: `${env.APP_SCOPE}`,
    display: "fullscreen",
    icons: [
      {
        "src": "logo.svg",
        "sizes": "64x64 32x32 24x24 16x16 192x192 512x512",
        "type": "image/svg"
      }
    ],
  };
  return {
    base: env.APP_SCOPE,
    plugins: [
      wyw(),
      react(),
      svgr(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest,
        injectRegister: 'inline',
        strategies: 'injectManifest',   // 使用注入模式
        srcDir: 'public',                  // 源文件目录
        filename: 'service-worker.js',              // 自定义 SW 文件名
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,jpg,png,svg}'],
        },
        devOptions: {
          enabled: true,      // 开发环境下启用 SW
          type: 'module',     // 使用 module 类型（仅 Chromium 内核）
        },
      }),
      visualizer({
        open: true, // 构建完成后自动打开报告
        filename: 'stats.html', // 生成的分析文件名
        gzipSize: true, // 显示 gzip 后的压缩大小
        brotliSize: true, // 显示 brotli 后的压缩大小
      }),
    ],
    build: {
      outDir: 'menu-plan',
    },
    server: {
      host: true,
      port: 3060,
      allowedHosts: ['max.local', 'jiayou.work'],
      proxy: {
        '/gw/menu-plan': {
          target: 'http://jiayou.work', // 后端接口地址
          changeOrigin: true, // 允许跨域
        }
      }
    }
  }
});