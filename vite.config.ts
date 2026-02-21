import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // UI libraries - Ant Design
          'vendor-antd': ['antd', '@ant-design/icons'],
          // UI libraries - Lucide icons
          'vendor-icons': ['lucide-react'],
          // Charts
          'vendor-charts': ['recharts'],
          // PDF generation
          'vendor-pdf': ['pdfmake'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next'],
          // Utilities
          'vendor-utils': ['decimal.js', 'zod'],
        },
      },
    },
    // Increase chunk size warning limit (default 500kb)
    chunkSizeWarningLimit: 600,
  },
  // Handle environment variables (REACT_APP_ -> VITE_)
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
});
