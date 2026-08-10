import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const rawPort = process.env.PORT;
if (!rawPort) throw new Error('PORT environment variable is required');
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

const basePath = process.env.BASE_PATH ?? '/customer-portal/';

export default defineConfig({
  base: basePath,
  plugins: [
    // Redirect /customer-portal (no trailing slash) → /customer-portal/
    {
      name: 'base-redirect',
      configureServer(server) {
        const base = basePath.replace(/\/$/, '');
        server.middlewares.use((req, res, next) => {
          if (req.url === base || req.url === base + '?') {
            res.writeHead(302, { Location: base + '/' });
            res.end();
            return;
          }
          next();
        });
      },
    },
    react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  preview: { port, host: '0.0.0.0', allowedHosts: true },
});
