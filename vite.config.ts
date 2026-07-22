import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Use relative asset paths so the built app works on GitHub Pages project URLs.
  base: './',
  plugins: [react()],
});
