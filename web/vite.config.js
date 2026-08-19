import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
// base must match the GitHub Pages repo name so asset paths resolve
// correctly when served from https://<user>.github.io/Sales-OPs/
export default defineConfig({
    base: "/Sales-OPs/",
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg"],
            manifest: {
                name: "Peak Empire",
                short_name: "Peak Empire",
                description: "Sales Intelligence Empire Builder",
                theme_color: "#0F172A",
                background_color: "#0F172A",
                display: "standalone",
                start_url: "/Sales-OPs/",
                scope: "/Sales-OPs/",
                icons: [
                    { src: "icon-192.png", sizes: "192x192", type: "image/png" },
                    { src: "icon-512.png", sizes: "512x512", type: "image/png" },
                ],
            },
        }),
    ],
});
