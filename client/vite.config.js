import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { inlineHtmlCss } from "./vite-plugin-inline-html-css.js";

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineHtmlCss()],
  // Rolldown (Vite 8+) does not support Rollup’s object form of manualChunks — omit or use a function API if needed.
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_DEV_API_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
