
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to resolve missing 'cwd' property error in build environments
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Fallback for general process.env usage if needed by libraries
      'process.env': env
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
    }
  };
});
