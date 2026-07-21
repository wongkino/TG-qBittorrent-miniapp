import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: rootDir,
  base: "/webapp/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, ".."),
    },
  },
  build: {
    outDir: path.resolve(rootDir, "../public/webapp"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
