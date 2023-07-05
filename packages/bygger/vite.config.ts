/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import * as dns from "dns";
import { readFileSync } from "fs";
import lodashTemplate from "lodash/template";
import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  server: {
    open: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  define: {
    global: "window",
  },
  resolve: {
    dedupe: ["formiojs"],
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    {
      name: "formio-template-handler",
      enforce: "pre",
      config() {},
      load(id: string) {
        if (!id.endsWith(".ejs")) {
          return null;
        }

        const code = readFileSync(id).toString("utf-8");
        // Use same values in Formio.Utils.Evaluator.templateSettings
        const template = lodashTemplate(code, {
          variable: "ctx",
          evaluate: /\{%([\s\S]+?)%}/g,
          interpolate: /\{\{([\s\S]+?)}}/g,
          escape: /\{\{\{([\s\S]+?)}}}/g,
        });

        return `export default ${template};`;
      },
    },
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    include: ["src/(**/)?*.{test,spec}.[jt]s(x)?"],
  },
});
