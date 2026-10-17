import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'path';
import fs from 'fs';
import os from 'os';
import path from 'path';

const devCertDir = path.join(os.homedir(), '.office-addin-dev-certs');
const certPath = path.join(devCertDir, 'localhost.crt');
const keyPath = path.join(devCertDir, 'localhost.key');
const hasDevCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);

const httpsConfig = hasDevCerts
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  : true;

export default defineConfig({
  // Office task panes must load assets relative to the manifest URL.
  // Using './' keeps the add-in working when hosted from GitHub Pages or a local/shared manifest path.
  base: './',
  plugins: hasDevCerts ? [] : [basicSsl()],
  server: {
    port: 3005,
    https: httpsConfig,
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        taskpane: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});