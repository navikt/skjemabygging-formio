import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const createFyllutTestStack = ({ repoRoot, ports, shouldWriteRuntimeConfig, nodeExecutable = process.execPath }) => {
  const [mockPort, mockAdminPort, backendPort, frontendPort] = ports;
  const mockUrl = `http://127.0.0.1:${mockPort}`;
  const backendUrl = `http://127.0.0.1:${backendPort}`;
  const frontendUrl = `http://127.0.0.1:${frontendPort}/fyllut`;
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
  };
  let runtimeWritten = false;

  return {
    commands: [
      [
        nodeExecutable,
        [
          resolve(repoRoot, 'mocks/node_modules/ts-node/dist/bin.js'),
          'mocks/server.ts',
          '--no-plugins.inquirerCli.enabled',
          `--server.port=${mockPort}`,
          `--plugins.adminApi.port=${mockAdminPort}`,
        ],
        {},
        resolve(repoRoot, 'mocks'),
      ],
      [
        nodeExecutable,
        [
          resolve(repoRoot, 'node_modules/vite/bin/vite.js'),
          '--clearScreen',
          'false',
          '--strictPort',
          '--port',
          String(backendPort),
        ],
        fyllutBackendEnv,
        resolve(repoRoot, 'packages/fyllut-backend'),
      ],
      [
        nodeExecutable,
        [
          resolve(repoRoot, 'node_modules/vite/bin/vite.js'),
          '--clearScreen',
          'false',
          '--strictPort',
          '--port',
          String(frontendPort),
        ],
        { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
        resolve(repoRoot, 'packages/fyllut'),
      ],
    ],
    healthUrls: [
      `${mockUrl}/forms-api/v1/global-translations`,
      `http://127.0.0.1:${mockAdminPort}/api/about`,
      `${backendUrl}/fyllut/internal/isready`,
      `${frontendUrl}/`,
    ],
    listeningPorts: [[mockPort, mockAdminPort], [backendPort], [frontendPort]],
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

export { createFyllutTestStack };
