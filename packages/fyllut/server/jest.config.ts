const config = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.{js,ts}"],
  setupFiles: ["<rootDir>/src/test/setupTests.js"],
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
};

export default config;
