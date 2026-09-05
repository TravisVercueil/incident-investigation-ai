import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Preserve the browser Host so Django can validate same-origin CSRF requests.
const apiProxy = { "/api": { target: "http://127.0.0.1:8103", changeOrigin: false } };

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
});
