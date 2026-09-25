import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  // three.js ships as its own lazy chunk (src/cinematic/world.ts), loaded after first paint.
  build: { chunkSizeWarningLimit: 700 },
});
