import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  e2e: {
    baseUrl: 'http://localhost:3001',
    viewportWidth: 1280,
    viewportHeight: 1000,
    testIsolation: false,
    env: {
      SKJEMABYGGING_PROXY_URL: 'http://127.0.0.1:3300/skjemabygging-proxy',
      AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: 'http://127.0.0.1:3300/azure-openid/oauth2/v2.0/token',
      FORMIO_PROJECT_URL: 'http://127.0.0.1:3300/formio-api',
      SEND_INN_HOST: 'http://127.0.0.1:3300/send-inn',
      TOKEN_X_WELL_KNOWN_URL: 'http://127.0.0.1:3300/tokenx/.well-known',
      BASE_URL: 'http://localhost:3001',
    },
  },
});
