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
      // 路径别名
      '@': path.join(__dirname, 'src'),
      // 图片别名
      '@assets': path.join(__dirname, 'src/assets'),
    },
  },

  build: {
    // 类型: boolean | 'esbuild' | 'terser'
    // 默认为 `esbuild`
    minify: 'esbuild',
    // 产物目标环境
    target: 'es6',
    // 如果 minify 为 terser，可以通过下面的参数配置具体行为
    // https://terser.org/docs/api-reference#minify-options
    terserOptions: {},
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库打包成单独的 chunk 中
          'react-vendor': ['react', 'react-dom'],
          // 将 Lodash 库的代码单独打包
          lodash: ['lodash-es'],
          // 将组件库的代码打包
          library: ['antd'],
        },
      },
    },
  },
});
