/// <reference types="vitest" />
import { defineConfig, PluginOption } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const plugins: PluginOption = [
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/server.js",
    }),
  ];

  if (mode !== "production") {
    plugins.push(tsconfigPaths());
  }

  return {
    server: {
      host: "127.0.0.1",
      port: 8080,
      strictPort: true,
    },
    preview: {
      host: "127.0.0.1",
      port: 8080,
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
  };
});
