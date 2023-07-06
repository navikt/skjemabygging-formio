/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import * as dns from "dns";
import { readFileSync } from "fs";
import lodashTemplate from "lodash/template";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import viteTsconfigPaths from "vite-tsconfig-paths";

dns.setDefaultResultOrder("verbatim");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "env");
  return {
    base: "/fyllut",
    server: {
      open: false,
      port: 3001,
      proxy: {
        "/fyllut/api": {
          target: "http://localhost:8081",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      dedupe: ["react-router-dom", "react-jss", "@navikt/ds-react", "@navikt/ds-icons"],
    },
    plugins: [
      react(),
      viteTsconfigPaths(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: { ...env },
        },
      }),
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
  };
});
