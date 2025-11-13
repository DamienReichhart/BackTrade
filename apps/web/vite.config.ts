import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [".."],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          "react-vendor": ["react", "react-dom"],
          // Routing
          router: ["react-router-dom"],
          // State management and data fetching
          "data-vendor": ["@tanstack/react-query", "zustand"],
          // Validation
          validation: ["zod"],
          // Charting library (likely large)
          charts: ["lightweight-charts"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
