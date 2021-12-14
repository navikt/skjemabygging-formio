import {defaults} from "jest-config";

const config = {
  testEnvironment: "jsdom",
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ejs'],

  setupFilesAfterEnv: [
    "<rootDir>/setupTests.js"
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  moduleNameMapper: {
    "nav-(.*)-style": "<rootDir>/__mocks__/styleMock.js",
    "nav-frontend-core": "<rootDir>/__mocks__/styleMock.js",
    "@navikt/ds-icons": "<rootDir>/__mocks__/dsIconsMock.js",
    "datovelger.less": "<rootDir>/__mocks__/styleMock.js",
  },
  transform: {
    "\\.ejs$": "<rootDir>/test/jest-ejs.transformer.js",
    "\\.[j|t]sx?$": "babel-jest",
  }
};

export default config;
