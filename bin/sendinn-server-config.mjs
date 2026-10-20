import { resolve } from 'node:path';

/**
 * @param {{repoRoot: string, ports: number[], mode?: 'dev' | 'built', testMode?: boolean}} options
 * @returns {{baseURL: string, mockURL: string, adminURL: string, backendURL: string,
 *   commands: [string, string[], Record<string, string>, string][], healthURLs: string[]}}
 */
const createSendinnServerConfig = ({ repoRoot, ports, mode = 'dev', testMode = false }) => {
  const [mockPort, mockAdminPort, backendPort, frontendPort] = ports;
  const mockURL = `http://127.0.0.1:${mockPort}`;
  const adminURL = `http://127.0.0.1:${mockAdminPort}`;
  const backendURL = `http://127.0.0.1:${backendPort}`;
  const baseURL = mode === 'built' ? backendURL : `http://127.0.0.1:${frontendPort}`;
  const vite = resolve(repoRoot, 'node_modules/vite/bin/vite.js');
  const backendEnv = {
    NODE_ENV: 'development',
    NO_DECORATOR: 'true',
    FORMS_API_URL: `${mockURL}/forms-api`,
    NAIS_TOKEN_INTROSPECTION_ENDPOINT: `${mockURL}/texas/introspect`,
    NAIS_TOKEN_EXCHANGE_ENDPOINT: `${mockURL}/texas/exchange`,
    ...(mode === 'built'
      ? { PORT: String(backendPort), SENDINN_BUILD_DIR: resolve(repoRoot, 'packages/sendinn/dist') }
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
          '--mock.collections.selected=sendinn-base',
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
          ? [resolve(repoRoot, 'packages/sendinn-backend/dist/server.mjs')]
          : [vite, '--clearScreen', 'false', '--strictPort', '--host', '127.0.0.1', '--port', String(backendPort)],
        backendEnv,
        resolve(repoRoot, 'packages/sendinn-backend'),
      ],
      ...(mode === 'built'
        ? []
        : [
            [
              process.execPath,
              [vite, '--clearScreen', 'false', '--strictPort', '--host', '127.0.0.1', '--port', String(frontendPort)],
              { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
              resolve(repoRoot, 'packages/sendinn'),
            ],
          ]),
    ],
    healthURLs: [
      `${mockURL}/forms-api/v1/published-global-translations/nb`,
      `${adminURL}/api/about`,
      `${backendURL}/sendinn/internal/isReady`,
      `${baseURL}/sendinn/`,
    ],
  };
};

export { createSendinnServerConfig };
