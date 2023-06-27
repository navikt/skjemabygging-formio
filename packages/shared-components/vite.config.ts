import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import lodashTemplate from "lodash/template";
import * as path from "path";
import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "shared-component",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
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
});
