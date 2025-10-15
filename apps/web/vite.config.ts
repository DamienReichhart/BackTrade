import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@backtrade/types": path.resolve(__dirname, "../../packages/types/src"),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});
