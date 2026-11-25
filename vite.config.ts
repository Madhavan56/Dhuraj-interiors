import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiPort = process.env.API_PORT ?? "4000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Keep the browser's Host header: the API's same-origin guard compares it
    // with Origin, and rewriting it to the API port rejects every admin write.
    proxy: {
      "/api": { target: `http://localhost:${apiPort}`, changeOrigin: false },
      "/uploads": { target: `http://localhost:${apiPort}`, changeOrigin: false },
    },
  },
});
