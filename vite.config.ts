import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // SPA 回退：所有非文件请求都返回 index.html
        middlewareMode: false,
      },
      plugins: [
        react(),
        // 自定义中间件处理 SPA 路由
        {
          name: 'spa-fallback',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              // 如果请求的是 /admin 路径，重写到 /
              if (req.url === '/admin' || req.url === '/admin/') {
                req.url = '/';
              }
              next();
            });
          },
        },
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      appType: 'spa',
    };
});
