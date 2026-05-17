import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/finance-pwa/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Finanças",
        short_name: "Finanças",
        description: "App pessoal de finanças offline",
        theme_color: "#111827",
        background_color: "#f4f4f5",
        display: "standalone",
        scope: "/finance-pwa/",
        start_url: "/finance-pwa/",
        icons: [
          {
            src: "/finance-pwa/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/finance-pwa/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
      }
    })
  ]
});