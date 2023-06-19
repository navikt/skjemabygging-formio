import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "shared-component",
      formats: ["es", "umd"],
      fileName: "index",
    },
  },
  assetsInclude: ["**/*.ejs"],
  plugins: [react(), tsconfigPaths()],
});
