import { Backend } from "../../src/Backend";
import { FormioService } from "../../src/services/formioService";

const { Response } = jest.requireActual("node-fetch");

const FORMIO_PROJECT_URL = "https://projectApi.example.com";

export const createBackendForTest = () => {
  return new Backend(
    {
      formio: {
        projectUrl: FORMIO_PROJECT_URL,
      },
      publishRepo: {
        owner: "publish-repo-owner",
        name: "publish-repo",
        submoduleName: "submodule-repo",
        base: "publish-repo-main-branch",
        token: "publishRepoToken",
      },
      gitSha: "publish-repo-git-sha",
    },
    new FormioService(FORMIO_PROJECT_URL)
  );
};

export const jsonToPromise = (json) => Promise.resolve(new Response(JSON.stringify(json)));
