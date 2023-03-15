import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "shared-domain",
      formats: ["es", "umd"],
      fileName: "index",
    },
  },
  plugins: [react()],
  /*
  optimizeDeps: {
    exclude: [
      "*.ejs"
    ]
  },*/
  resolve: {
    alias: {
      "@navikt/skjemadigitalisering-shared-domain": path.resolve(__dirname, "../shared-domain/dist/index.js"),
    },
  },
});
