import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps the build host-agnostic (GitHub Pages sub-paths, Netlify, Vercel, any static server).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { target: "es2020", assetsInlineLimit: 200000, chunkSizeWarningLimit: 900 },
});
