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
      FORMS_SOURCE: 'formsapi-published',
      NAIS_TOKEN_INTROSPECTION_ENDPOINT: `${mockURL}/texas/introspect`,
      NAIS_TOKEN_EXCHANGE_ENDPOINT: `${mockURL}/texas/exchange`,
    }),
    mockArgs: ['--mock.collections.selected=sendinn-base'],
    mockHealthPath: '/forms-api/v1/published-global-translations/nb',
    backendHealthPath: '/sendinn/internal/isReady',
  });

export { createSendinnServerConfig };
