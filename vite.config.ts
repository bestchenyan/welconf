import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteStylelint from 'vite-plugin-stylelint';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    viteStylelint({
      exclude: ['node_modules'],
    }),
  ],
  resolve: {
    alias: {
      // 图片别名
      '@assets': path.join(__dirname, 'src/assets'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库打包成单独的 chunk 中
          'react-vendor': ['react', 'react-dom'],
          // 将 Lodash 库的代码单独打包
          lodash: ['lodash-es'],
        },
      },
    },
  },
});
