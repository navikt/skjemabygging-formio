import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    viewportWidth: 1280,
    viewportHeight: 1000,
    testIsolation: false,
    setupNodeEvents(on, config) {},
  },
});
