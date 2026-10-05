import { defineConfig } from "astro/config";

export default defineConfig({
  vite: {
    // The WASM engine loads its .wasm file itself; Vite must not pre-bundle it.
    optimizeDeps: { exclude: ["@surrealdb/wasm"] },
    build: { target: "esnext" },
  },
});
