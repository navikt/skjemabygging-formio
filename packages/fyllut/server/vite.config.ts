/// <reference types="vitest" />
import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import tsconfigPaths from "vite-tsconfig-paths";

export default ({ mode }) => {
  const plugins = mode === "production" ? [] : [tsconfigPaths()];
  plugins.push(
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/server.js",
    }),
  );
  return defineConfig({
    base: "/fyllut",
    server: {
      host: "127.0.0.1",
      port: 8081,
      strictPort: true,
    },
    preview: {
      host: "127.0.0.1",
      port: 8081,
      strictPort: true,
    },
    build: {
      rollupOptions: {
        input: "./src/server.js",
        output: {
          entryFileNames: "[name].mjs",
        },
      },
    },
    plugins,
    test: {
      globals: true,
      setupFiles: "./src/setupTests.ts",
      include: ["src/(**/)?*.test.[jt]s(x)?"],
    },
  });
};
