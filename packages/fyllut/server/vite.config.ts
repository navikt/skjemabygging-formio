/// <reference types="vitest" />
import * as dns from "dns";
import { VitePluginNode } from "vite-plugin-node";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  server: {
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
