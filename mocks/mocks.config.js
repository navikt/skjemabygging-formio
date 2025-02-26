// For a detailed explanation regarding each configuration property, visit:
// https://www.mocks-server.org/docs/configuration/how-to-change-settings
// https://www.mocks-server.org/docs/configuration/options

module.exports = {
  config: {},
  plugins: {
    proxyRoutesHandler: {},
    adminApi: {
      port: 3310,
      https: {},
    },
    inquirerCli: {},
    openapi: {
      collection: {},
    },
  },
  mock: {
    routes: {},
    collections: {
      selected: 'fyllut-base',
    },
  },
  server: {
    host: 'localhost',
    port: 3300,
    cors: {},
    jsonBodyParser: {},
    urlEncodedBodyParser: {},
    https: {},
  },
  files: {
    babelRegister: {},
  },
  variantHandlers: {},
};
