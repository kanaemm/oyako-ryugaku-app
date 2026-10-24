import { defineConfig } from 'vite';
// GitHub Pages uses /repository-name/; other hosts can keep the default root.
export default defineConfig({ base: process.env.APP_BASE_PATH || '/' });
