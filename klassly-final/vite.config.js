import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "icons/*.svg"],

      // Web App Manifest – steuert wie die App auf dem Homescreen aussieht
      manifest: {
        name: "Hausaufgaben",
        short_name: "Hausaufgaben",
        description: "Hausaufgaben gemeinsam im Blick behalten",
        theme_color: "#45B7D1",
        background_color: "#F5F7FA",
        display: "standalone",        // ← fühlt sich wie eine native App an
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      // Workbox – Caching-Strategie
      workbox: {
        // App-Shell offline cachen
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Supabase API-Calls: Network-first, Fallback auf Cache
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },

      // Dev-Mode: auch lokal als PWA testbar
      devOptions: { enabled: true },
    }),
  ],
});
