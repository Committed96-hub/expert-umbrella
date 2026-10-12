import { defineConfig } from "vite";
const apiProxy = {
  target: `http://localhost:${process.env.API_PORT || 8787}`,
  changeOrigin: false,
};
export default defineConfig({
  server: { proxy: { "/api": apiProxy } },
  preview: { proxy: { "/api": apiProxy } },
});
