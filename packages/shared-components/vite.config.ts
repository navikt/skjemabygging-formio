/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import lodashTemplate from "lodash/template";
import * as path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "shared-component",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-router-dom",
        "react-jss",
        "@navikt/ds-css",
        "@navikt/ds-icons",
        "@navikt/ds-react",
      ],
    },
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

        return `export default ${template}`;
      },
    },
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    include: ["src/(**/)?*.test.[jt]s(x)?"],
  },
});
