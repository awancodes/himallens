import { defineConfig } from 'vite';

export default defineConfig({
  // './' makes the built site work from any folder, e.g. GitHub Pages later.
  base: './',
  server: {
    port: 5173,
  },
});
