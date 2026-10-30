import { createAppServerConfig } from './app-server-config.mjs';

/**
 * @param {{repoRoot: string, ports: number[], mode?: 'dev' | 'built', testMode?: boolean}} options
 */
const createFyllutServerConfig = ({ testMode = false, ...options }) =>
  createAppServerConfig({
    ...options,
    testMode,
    app: 'fyllut',
    createBackendEnv: (mockURL) => ({
      MOCKS_ENABLED: 'true',
      SKJEMABYGGING_PROXY_URL: `${mockURL}/skjemabygging-proxy`,
      AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${mockURL}/azure-openid/oauth2/v2.0/token`,
      FORMIO_API_SERVICE: mockURL,
      FORMS_API_URL: `${mockURL}/forms-api`,
      SEND_INN_HOST: `${mockURL}/send-inn`,
      TILLEGGSSTONADER_HOST: `${mockURL}/register-data`,
      KODEVERK_URL: `${mockURL}/kodeverk`,
      TOKEN_X_WELL_KNOWN_URL: `${mockURL}/tokenx/.well-known`,
      FAMILIE_PDF_GENERATOR_URL: mockURL,
      TEAM_LOGS_URL: `${mockURL}/team-logs`,
      ...(testMode
        ? {
            NO_DECORATOR: 'true',
            FEATURE_NEW_RENDER_FORMS: '*',
            GIT_SHA: 'git-sha',
            MONOREPO_GIT_SHA: 'mr-sha',
            PDF_FOOTER_ENV_SLUG: 'dev-local',
          }
        : {}),
    }),
    mockHealthPath: '/forms-api/v1/global-translations',
    backendHealthPath: '/fyllut/internal/isready',
  });

export { createFyllutServerConfig };
