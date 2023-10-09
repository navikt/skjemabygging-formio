import { Backend } from '../../src/Backend';
import { FormioService } from '../../src/services/formioService';

const { Response } = await vi.importActual('node-fetch');

const FORMIO_PROJECT_URL = 'https://projectApi.example.com';

export const configForTest = {
  formio: {
    projectUrl: FORMIO_PROJECT_URL,
  },
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
  return new Backend(configForTest, new FormioService(FORMIO_PROJECT_URL));
};

export const jsonToPromise = (json) => Promise.resolve(new Response(JSON.stringify(json)));
