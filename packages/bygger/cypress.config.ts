import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    viewportWidth: 1200,
    viewportHeight: 1000,
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1500,
    viewportHeight: 1200,
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
