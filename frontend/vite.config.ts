import { defineConfig } from 'vite'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
    resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@Components": path.resolve(__dirname, "./src/components"),
      "@Utils": path.resolve(__dirname, "./src/lib/utils"),
      "@Assets": path.resolve(__dirname, "./src/assets"),
      "@Hooks": path.resolve(__dirname, "./src/hooks"),
      "@Styles": path.resolve(__dirname, "./src/styles"),
      "@Types": path.resolve(__dirname, "./src/types"),
      "@Providers": path.resolve(__dirname, "./src/providers"),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
