import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  optimizeDeps: {
    force: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI / animation libraries
          "vendor-ui": [
            "framer-motion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-tooltip",
          ],
          // Heavy document-export libs — only loaded when needed
          "vendor-export": ["jspdf"],
          // Spreadsheet lib
          "vendor-xlsx": ["xlsx"],
          // Map libs
          "vendor-map": ["leaflet"],
          // i18n
          "vendor-i18n": ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          // Data / query
          "vendor-query": ["@tanstack/react-query", "@supabase/supabase-js"],
          // Charts
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
}));
