import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { startManagedStack } from './managed-test-stack.mjs';
import { selectPorts, validatePorts } from './test-ports.mjs';

const createFyllutTestStack = ({
  repoRoot,
  ports,
  shouldWriteRuntimeConfig,
  nodeExecutable = process.execPath,
  mode = 'dev',
  epoch,
  observeMocks = true,
  mockFault,
}) => {
  if (!['dev', 'built'].includes(mode)) throw new Error(`Unsupported FyllUt stack mode: ${mode}`);
  const [mockPort, mockAdminPort, backendPort, frontendPort] = ports;
  const mockUrl = `http://127.0.0.1:${mockPort}`;
  const backendUrl = `http://127.0.0.1:${backendPort}`;
  const frontendUrl = `http://127.0.0.1:${mode === 'built' ? backendPort : frontendPort}/fyllut`;
  const runtimePath = resolve(repoRoot, 'packages/fyllut/.runtime/cypress.mocks.json');
  const fyllutBackendEnv = {
    NODE_ENV: 'development',
    MOCKS_ENABLED: 'true',
    SKJEMABYGGING_PROXY_URL: `${mockUrl}/skjemabygging-proxy`,
    AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${mockUrl}/azure-openid/oauth2/v2.0/token`,
    FORMIO_API_SERVICE: mockUrl,
    FORMS_API_URL: `${mockUrl}/forms-api`,
    SEND_INN_HOST: `${mockUrl}/send-inn`,
    TILLEGGSSTONADER_HOST: `${mockUrl}/register-data`,
    KODEVERK_URL: `${mockUrl}/kodeverk`,
    TOKEN_X_WELL_KNOWN_URL: `${mockUrl}/tokenx/.well-known`,
    FAMILIE_PDF_GENERATOR_URL: mockUrl,
    TEAM_LOGS_URL: `${mockUrl}/team-logs`,
    ...(epoch
      ? {
          NO_DECORATOR: 'true',
          FEATURE_NEW_RENDER_FORMS: '*',
          GIT_SHA: 'git-sha',
          MONOREPO_GIT_SHA: 'mr-sha',
          PDF_FOOTER_ENV_SLUG: 'dev-local',
        }
      : {}),
    ...(mode === 'built'
      ? {
          PORT: String(backendPort),
          FYLLUT_BUILD_DIR: resolve(repoRoot, 'packages/fyllut/dist'),
        }
      : {}),
  };
  let runtimeWritten = false;

  return {
    ports,
    baseURL: `http://127.0.0.1:${mode === 'built' ? backendPort : frontendPort}`,
    backendURL: backendUrl,
    mockURL: mockUrl,
    adminURL: `http://127.0.0.1:${mockAdminPort}`,
    serviceNames: mode === 'built' ? ['mocks', 'backend'] : ['mocks', 'backend', 'frontend'],
    commands: [
      [
        nodeExecutable,
        [
          resolve(repoRoot, 'mocks/node_modules/ts-node/dist/bin.js'),
          'mocks/server.ts',
          '--no-plugins.inquirerCli.enabled',
          `--server.port=${mockPort}`,
          `--plugins.adminApi.port=${mockAdminPort}`,
          ...(epoch ? ['--server.host=127.0.0.1', '--plugins.adminApi.host=127.0.0.1'] : []),
        ],
        epoch && observeMocks
          ? {
              FYLLUT_PLAYWRIGHT_EPOCH: epoch,
              ...(mockFault ? { FYLLUT_PLAYWRIGHT_TEST_FAULT: mockFault } : {}),
            }
          : { FYLLUT_PLAYWRIGHT_EPOCH: '', FYLLUT_PLAYWRIGHT_TEST_FAULT: '' },
        resolve(repoRoot, 'mocks'),
      ],
      [
        nodeExecutable,
        mode === 'built'
          ? [resolve(repoRoot, 'packages/fyllut-backend/dist/server.mjs')]
          : [
              resolve(repoRoot, 'node_modules/vite/bin/vite.js'),
              '--clearScreen',
              'false',
              '--strictPort',
              '--host',
              '127.0.0.1',
              '--port',
              String(backendPort),
            ],
        fyllutBackendEnv,
        resolve(repoRoot, 'packages/fyllut-backend'),
      ],
      ...(mode === 'built'
        ? []
        : [
            [
              nodeExecutable,
              [
                resolve(repoRoot, 'node_modules/vite/bin/vite.js'),
                '--clearScreen',
                'false',
                '--strictPort',
                '--host',
                '127.0.0.1',
                '--port',
                String(frontendPort),
              ],
              { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
              resolve(repoRoot, 'packages/fyllut'),
            ],
          ]),
    ],
    healthUrls: [
      `${mockUrl}/forms-api/v1/global-translations`,
      `http://127.0.0.1:${mockAdminPort}/api/about`,
      `${backendUrl}/fyllut/internal/isready`,
      `${frontendUrl}/`,
    ],
    listeningPorts: [[mockPort, mockAdminPort], [backendPort], ...(mode === 'built' ? [] : [[frontendPort]])],
    summaryLines: [
      `FYLLUT_MOCK_URL=${mockUrl}`,
      `FYLLUT_MOCK_ADMIN_PORT=${mockAdminPort}`,
      `FYLLUT_BACKEND_URL=${backendUrl}`,
      `FYLLUT_FRONTEND_URL=${frontendUrl}`,
    ],
    onReady: shouldWriteRuntimeConfig
      ? () => {
          mkdirSync(resolve(repoRoot, 'packages/fyllut/.runtime'), { recursive: true });
          runtimeWritten = true;
          writeFileSync(
            runtimePath,
            JSON.stringify(
              {
                baseUrl: `http://127.0.0.1:${frontendPort}`,
                env: {
                  SKJEMABYGGING_PROXY_URL: `${mockUrl}/skjemabygging-proxy`,
                  AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${mockUrl}/azure-openid/oauth2/v2.0/token`,
                  FORMIO_PROJECT_URL: `${mockUrl}/formio-api`,
                  MOCKS_ADMIN_PORT: String(mockAdminPort),
                  SEND_INN_HOST: `${mockUrl}/send-inn`,
                  SEND_INN_FRONTEND: `${mockUrl}/send-inn-frontend`,
                  TOKEN_X_WELL_KNOWN_URL: `${mockUrl}/tokenx/.well-known`,
                  BASE_URL: `http://127.0.0.1:${frontendPort}`,
                  FAMILIE_PDF_GENERATOR_URL: mockUrl,
                },
              },
              null,
              2,
            ),
          );
        }
      : undefined,
    onCleanup: shouldWriteRuntimeConfig
      ? () => {
          if (runtimeWritten) rmSync(runtimePath, { force: true });
        }
      : undefined,
  };
};

const startFyllutTestStack = async (
  { ports: fixedPorts, portRange, ...configuration },
  { start = startManagedStack, ...options } = {},
) => {
  if (fixedPorts && portRange) throw new Error('TEST_PORT_OPTIONS_CONFLICT');
  if (fixedPorts) validatePorts(fixedPorts);
  const startupAttempts = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    let ports;
    try {
      ports =
        fixedPorts ??
        (await selectPorts(4, {
          range: portRange,
          signal: options.signal,
          exclude: startupAttempts.flatMap((record) => record.ports),
        }));
    } catch (error) {
      error.startupAttempts = startupAttempts;
      throw error;
    }
    const plan = createFyllutTestStack({ ...configuration, ports });
    const record = { ports, pids: [], startedAt: new Date().toISOString() };
    startupAttempts.push(record);
    try {
      const stack = await start(plan, {
        ...options,
        onSpawn: (pid) => {
          record.pids.push(pid);
          options.onSpawn?.(pid);
        },
      });
      record.readyAt = new Date().toISOString();
      return { ...plan, ...stack, startupAttempts };
    } catch (error) {
      record.errorCode = error.code ?? null;
      if (error instanceof AggregateError) record.cleanupFailed = true;
      else record.cleanedUpAt = new Date().toISOString();
      error.startupAttempts = startupAttempts;
      if (fixedPorts || error.code !== 'EADDRINUSE' || attempt === 2) throw error;
      options.signal?.throwIfAborted();
      options.log?.(`STACK_PORT_RETRY: ${ports.join(', ')}\n`);
    }
  }
};

export { createFyllutTestStack, startFyllutTestStack };
