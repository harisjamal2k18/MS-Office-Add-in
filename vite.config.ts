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
    rollupOptions: {
      input: {
        taskpane: resolve(__dirname, 'index.html')
      }
    }
  }
});
