const config = {
  testEnvironment: "node",
  collectCoverageFrom: ["<rootDir>/src/**/*.{js,ts}"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
  setupFiles: ["<rootDir>/src/test/setupTests.js"],
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
};

export default config;
