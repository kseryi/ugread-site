import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'copy-vanilla-assets',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const distJsDir = path.resolve(distDir, 'src/js');
        const distCssDir = path.resolve(distDir, 'src/css');

        if (!fs.existsSync(distJsDir)) fs.mkdirSync(distJsDir, { recursive: true });
        if (!fs.existsSync(distCssDir)) fs.mkdirSync(distCssDir, { recursive: true });

        const appJsSrc = path.resolve(__dirname, 'src/js/app.js');
        const appJsDist = path.resolve(distJsDir, 'app.js');
        if (fs.existsSync(appJsSrc)) {
          fs.copyFileSync(appJsSrc, appJsDist);
        }

        const cssSrc = path.resolve(__dirname, 'src/css/styles.css');
        const cssDist = path.resolve(distCssDir, 'styles.css');
        if (fs.existsSync(cssSrc)) {
          fs.copyFileSync(cssSrc, cssDist);
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
