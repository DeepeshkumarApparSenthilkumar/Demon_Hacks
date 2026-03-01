import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // All /api calls go to the Express server — no keys in frontend ever
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
