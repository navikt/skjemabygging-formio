import { Backend } from '../../src/Backend';
import { FormioService } from '../../src/services/formioService';

const { Response } = await vi.importActual('node-fetch');

const FORMIO_API_SERVICE_URL = 'https://projectApi.example.com';

export const configForTest = {
  publishRepo: {
    owner: 'publish-repo-owner',
    name: 'publish-repo',
    base: 'publish-repo-main-branch',
    token: 'publishRepoToken',
  },
  gitSha: 'publish-repo-git-sha',
  githubApp: {
    appId: 'test',
    clientId: 'id',
    clientSecret: 'secret',
    privateKey: 'privateKey',
  },
};

export const createBackendForTest = () => {
  return new Backend(configForTest, new FormioService(FORMIO_API_SERVICE_URL));
};

export const jsonToPromise = (json) => Promise.resolve(new Response(JSON.stringify(json)));
