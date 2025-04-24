import { Backend } from '../../src/Backend';

const { Response } = await vi.importActual('node-fetch');

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
  return new Backend(configForTest);
};

export const jsonToPromise = (json) => Promise.resolve(new Response(JSON.stringify(json)));
