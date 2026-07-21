import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  base: '/',
  css: {
    preprocessorOptions: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.360eye.in',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path
      },
    },
    host: '0.0.0.0', // Allow access from any device on the local network
    port: 3001, // You can specify any port if needed
  },
});
