import { resolve } from 'node:path';

/**
 * @param {{repoRoot: string, ports: number[], mode?: 'dev' | 'built', testMode?: boolean}} options
 * @returns {{baseURL: string, mockURL: string, adminURL: string, backendURL: string,
 *   commands: [string, string[], Record<string, string>, string][], healthURLs: string[]}}
 */
const createFyllutServerConfig = ({ repoRoot, ports, mode = 'dev', testMode = false }) => {
  const [mockPort, mockAdminPort, backendPort, frontendPort] = ports;
  const mockURL = `http://127.0.0.1:${mockPort}`;
  const adminURL = `http://127.0.0.1:${mockAdminPort}`;
  const backendURL = `http://127.0.0.1:${backendPort}`;
  const baseURL = mode === 'built' ? backendURL : `http://127.0.0.1:${frontendPort}`;
  const vite = resolve(repoRoot, 'node_modules/vite/bin/vite.js');
  const backendEnv = {
    NODE_ENV: 'development',
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
    ...(mode === 'built'
      ? { PORT: String(backendPort), FYLLUT_BUILD_DIR: resolve(repoRoot, 'packages/fyllut/dist') }
      : {}),
  };
  return {
    baseURL,
    mockURL,
    adminURL,
    backendURL,
    commands: [
      [
        process.execPath,
        [
          resolve(repoRoot, 'mocks/node_modules/ts-node/dist/bin.js'),
          'mocks/server.ts',
          '--no-plugins.inquirerCli.enabled',
          `--server.port=${mockPort}`,
          `--plugins.adminApi.port=${mockAdminPort}`,
          ...(testMode ? ['--server.host=127.0.0.1', '--plugins.adminApi.host=127.0.0.1', '--no-files.watch'] : []),
        ],
        testMode ? { TS_NODE_TRANSPILE_ONLY: 'true' } : {},
        resolve(repoRoot, 'mocks'),
      ],
      [
        process.execPath,
        mode === 'built'
          ? [resolve(repoRoot, 'packages/fyllut-backend/dist/server.mjs')]
          : [vite, '--clearScreen', 'false', '--strictPort', '--host', '127.0.0.1', '--port', String(backendPort)],
        backendEnv,
        resolve(repoRoot, 'packages/fyllut-backend'),
      ],
      ...(mode === 'built'
        ? []
        : [
            [
              process.execPath,
              [vite, '--clearScreen', 'false', '--strictPort', '--host', '127.0.0.1', '--port', String(frontendPort)],
              { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
              resolve(repoRoot, 'packages/fyllut'),
            ],
          ]),
    ],
    healthURLs: [
      `${mockURL}/forms-api/v1/global-translations`,
      `${adminURL}/api/about`,
      `${backendURL}/fyllut/internal/isready`,
      `${baseURL}/fyllut/`,
    ],
  };
};

export { createFyllutServerConfig };
