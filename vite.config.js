import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Klassly",
        short_name: "Klassly",
        theme_color: "#45B7D1",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {},
  },
  optimizeDeps: {
    include: ["@neondatabase/neon-js"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
