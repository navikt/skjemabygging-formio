import { defineConfig } from 'cypress';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

type RuntimeConfig = {
  baseUrl?: string;
  env?: Record<string, string | number | boolean>;
};

const runtimeConfigPath = resolve(dirname(fileURLToPath(import.meta.url)), '.runtime', 'cypress.mocks.json');

const runtimeConfig: RuntimeConfig = existsSync(runtimeConfigPath)
  ? JSON.parse(readFileSync(runtimeConfigPath, 'utf-8'))
  : {};

const baseUrl = runtimeConfig.baseUrl ?? 'http://localhost:3001';
const mockBaseUrl = 'http://127.0.0.1:3300';
const mockAdminPort = Number(runtimeConfig.env?.MOCKS_ADMIN_PORT ?? 3310);

export default defineConfig({
  video: false,
  e2e: {
    baseUrl,
    viewportWidth: 1280,
    viewportHeight: 1000,
    testIsolation: false,
    env: {
      SKJEMABYGGING_PROXY_URL: `${mockBaseUrl}/skjemabygging-proxy`,
      AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${mockBaseUrl}/azure-openid/oauth2/v2.0/token`,
      FORMIO_PROJECT_URL: `${mockBaseUrl}/formio-api`,
      MOCKS_ADMIN_PORT: mockAdminPort,
      SEND_INN_HOST: `${mockBaseUrl}/send-inn`,
      SEND_INN_FRONTEND: `${mockBaseUrl}/send-inn-frontend`,
      TOKEN_X_WELL_KNOWN_URL: `${mockBaseUrl}/tokenx/.well-known`,
      BASE_URL: baseUrl,
      FAMILIE_PDF_GENERATOR_URL: mockBaseUrl,
      INCLUDE_DIST_TESTS: false,
      ...runtimeConfig.env,
    },
  },
});
