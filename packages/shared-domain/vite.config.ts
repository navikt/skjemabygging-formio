import * as path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "shared-domain",
      formats: ["es"],
      fileName: "index",
    },
  },
});
