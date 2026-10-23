import { resolve } from 'node:path';

/**
 * Mocks, backend and frontend commands for an app served under /<app> by packages/<app>-backend,
 * with its frontend in packages/<app>.
 * @param {{repoRoot: string, ports: number[], mode?: 'dev' | 'built', testMode?: boolean, app: string,
 *   createBackendEnv: (mockURL: string) => Record<string, string>, mockArgs?: string[],
 *   mockHealthPath: string, backendHealthPath: string}} options
 * @returns {{baseURL: string, mockURL: string, adminURL: string, backendURL: string,
 *   commands: [string, string[], Record<string, string>, string][], healthURLs: string[]}}
 */
const createAppServerConfig = ({
  repoRoot,
  ports,
  mode = 'dev',
  testMode = false,
  app,
  createBackendEnv,
  mockArgs = [],
  mockHealthPath,
  backendHealthPath,
}) => {
  const [mockPort, mockAdminPort, backendPort, frontendPort] = ports;
  const mockURL = `http://127.0.0.1:${mockPort}`;
  const adminURL = `http://127.0.0.1:${mockAdminPort}`;
  const backendURL = `http://127.0.0.1:${backendPort}`;
  const baseURL = mode === 'built' ? backendURL : `http://127.0.0.1:${frontendPort}`;
  const vite = resolve(repoRoot, 'node_modules/vite/bin/vite.js');
  const backendEnv = {
    NODE_ENV: 'development',
    ...createBackendEnv(mockURL),
    ...(mode === 'built'
      ? { PORT: String(backendPort), [`${app.toUpperCase()}_BUILD_DIR`]: resolve(repoRoot, `packages/${app}/dist`) }
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
          ...mockArgs,
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
          ? [resolve(repoRoot, `packages/${app}-backend/dist/server.mjs`)]
          : [vite, '--clearScreen', 'false', '--strictPort', '--host', '127.0.0.1', '--port', String(backendPort)],
        backendEnv,
        resolve(repoRoot, `packages/${app}-backend`),
      ],
      ...(mode === 'built'
        ? []
        : [
            [
              process.execPath,
              [vite, '--clearScreen', 'false', '--strictPort', '--host', '127.0.0.1', '--port', String(frontendPort)],
              { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
              resolve(repoRoot, `packages/${app}`),
            ],
          ]),
    ],
    healthURLs: [
      `${mockURL}${mockHealthPath}`,
      `${adminURL}/api/about`,
      `${backendURL}${backendHealthPath}`,
      `${baseURL}/${app}/`,
    ],
  };
};

export { createAppServerConfig };
