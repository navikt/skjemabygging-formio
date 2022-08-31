import { defaults } from "jest-config";

const config = {
  testEnvironment: "jsdom",
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ejs"],
  transformIgnorePatterns: ["/node_modules/(?!@navikt/ds-icons)"],
  moduleNameMapper: {
    "nav-(.*)-style": "<rootDir>/__mocks__/styleMock.js",
    "nav-frontend-core": "<rootDir>/__mocks__/styleMock.js",
    "datovelger.less": "<rootDir>/__mocks__/styleMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
  transform: {
    "\\.ejs$": "<rootDir>/test/jest-ejs.transformer.js",
    "\\.[j|t]sx?$": "babel-jest",
  },
};

export default config;
