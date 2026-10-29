import { createAppServerConfig } from './app-server-config.mjs';

/**
 * @param {{repoRoot: string, ports: number[], mode?: 'dev' | 'built', testMode?: boolean}} options
 */
const createSendinnServerConfig = (options) =>
  createAppServerConfig({
    ...options,
    app: 'sendinn',
    createBackendEnv: (mockURL) => ({
      NO_DECORATOR: 'true',
      FORMS_API_URL: `${mockURL}/forms-api`,
      SENDINN_CONTENT_SOURCE: 'latest',
      NORG2_URL: mockURL,
      SKJEMABYGGING_PROXY_URL: `${mockURL}/skjemabygging-proxy`,
      SKJEMABYGGING_PROXY_CLIENT_ID: 'mock-proxy',
      SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN: '',
      AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${mockURL}/azure-openid/oauth2/v2.0/token`,
      AZURE_APP_CLIENT_ID: 'mock-sendinn',
      AZURE_APP_CLIENT_SECRET: 'mock-credential',
      NAIS_TOKEN_INTROSPECTION_ENDPOINT: `${mockURL}/texas/introspect`,
      NAIS_TOKEN_EXCHANGE_ENDPOINT: `${mockURL}/texas/exchange`,
    }),
    mockArgs: ['--mock.collections.selected=sendinn-base'],
    mockHealthPath: '/forms-api/v1/global-translations',
    backendHealthPath: '/sendinn/internal/isReady',
  });

export { createSendinnServerConfig };
