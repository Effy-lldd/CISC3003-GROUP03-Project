import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  envDir: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/login.html'),
        dashboard: resolve(__dirname, 'src/dashboard.html'),
        transactions: resolve(__dirname, 'src/transactions.html'),
        categories: resolve(__dirname, 'src/categories.html'),
        reports: resolve(__dirname, 'src/reports.html'),
        help: resolve(__dirname, 'src/help.html'),
        'forgot-password': resolve(__dirname, 'src/forgot-password.html'),
        'reset-password': resolve(__dirname, 'src/reset-password.html'),
        'test-api': resolve(__dirname, 'src/test-api.html'),
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://my-money-budget.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    }
  }
});