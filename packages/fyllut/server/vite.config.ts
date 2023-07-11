/// <reference types="vitest" />
import { VitePluginNode } from "vite-plugin-node";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/fyllut",
  server: {
    port: 8081,
  },
  preview: {
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
