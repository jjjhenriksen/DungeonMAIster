import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{js,jsx}"],
    setupFiles: "./tests/setupTests.js",
  },
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
  preview: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
