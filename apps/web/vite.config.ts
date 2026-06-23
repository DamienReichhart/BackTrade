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
                // Vite 8 bundles with Rolldown, which dropped the object form of
                // `manualChunks`. The equivalent is `codeSplitting.groups`, matching
                // modules by id (use `[\\/]` for the path separator per Rolldown docs).
                codeSplitting: {
                    groups: [
                        // React core libraries
                        { name: "react-vendor", test: /[\\/]node_modules[\\/]react(-dom)?[\\/]/ },
                        // Routing
                        { name: "router", test: /[\\/]node_modules[\\/]react-router(-dom)?[\\/]/ },
                        // State management and data fetching
                        { name: "data-vendor", test: /[\\/]node_modules[\\/](@tanstack[\\/]react-query|zustand)[\\/]/ },
                        // Validation
                        { name: "validation", test: /[\\/]node_modules[\\/]zod[\\/]/ },
                        // Charting library (likely large)
                        { name: "charts", test: /[\\/]node_modules[\\/]lightweight-charts[\\/]/ },
                    ],
                },
            },
        },
        chunkSizeWarningLimit: 600,
    },
});
