import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente (quelle che imposterai su Vercel)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [tailwindcss()],
    define: {
      // Questo rende la chiave disponibile nel tuo codice JS tramite process.env
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disabilita l'Hot Module Replacement se richiesto, utile in certi ambienti di debug
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
