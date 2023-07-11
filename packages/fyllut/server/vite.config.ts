/// <reference types="vitest" />
import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/fyllut",
  server: {
    host: "127.0.0.1",
    port: 8081,
  },
  preview: {
    host: "127.0.0.1",
    port: 8081,
  },
  build: {
    rollupOptions: {
      input: "./src/server.js",
    },
  },
  plugins: [
    tsconfigPaths(),
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/server.js",
    }),
  ],
  test: {
    globals: true,
    setupFiles: "./src/setupTests.ts",
    include: ["src/(**/)?*.test.[jt]s(x)?"],
  },
});
