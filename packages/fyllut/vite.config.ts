import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/fyllut",
  server: {
    open: true,
    port: 3001,
    proxy: {
      "/fyllut/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
  assetsInclude: ["**/*.ejs"],
  plugins: [react(), viteTsconfigPaths()],
});
