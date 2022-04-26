import { Backend } from "../../src/Backend";

const { Response } = jest.requireActual("node-fetch");

export const createBackendForTest = () => {
  return new Backend({
    formio: {
      projectUrl: "https://projectApi.example.com",
    },
    publishRepo: {
      owner: "publish-repo-owner",
      name: "publish-repo",
      submoduleName: "submodule-repo",
      base: "publish-repo-main-branch",
      token: "publishRepoToken",
    },
    gitSha: "publish-repo-git-sha",
  });
};

export const jsonToPromise = (json) => Promise.resolve(new Response(JSON.stringify(json)));
