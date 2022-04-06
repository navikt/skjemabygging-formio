const config = {
  testEnvironment: "node",
  collectCoverageFrom: ["<rootDir>/src/**/*.{js,ts}"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
  setupFiles: ["<rootDir>/src/test/setupTests.js"],
  transform: {
    "^.+\\.[j|t]s$": "babel-jest",
  },
};

export default config;
