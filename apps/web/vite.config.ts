import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true, proxy: { '/api': 'http://api:8080' } },
  build: { outDir: 'dist' },
  publicDir: 'public'
});
import { defineConfig } from vite;
import react from @vitejs/plugin-react-swc;

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true, proxy: { /api: http://api:8080 } }
});
