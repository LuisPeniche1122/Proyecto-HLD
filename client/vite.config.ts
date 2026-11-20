/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Se integran los plugins necesarios para el empaquetado y los estilos
  plugins: [
    react(),
    tailwindcss(), // <-- Esta es la pieza que faltaba para compilar el CSS
  ],
  
  // Configuración del entorno de desarrollo
  server: {
    host: true, // Expone el servidor a la red de Docker
    port: 5173,
    watch: {
      usePolling: true, // Necesario en Docker/WSL para forzar la detección de cambios
    }
  },
  
  // Configuración del entorno de pruebas
  test: {
    environment: 'jsdom',
    globals: true,
  }
});