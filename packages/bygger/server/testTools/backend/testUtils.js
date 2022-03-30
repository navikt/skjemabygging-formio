import { Backend } from "../../backend/Backend";

const { Response } = jest.requireActual("node-fetch");

export const createBackendForTest = () => {
  const projectURL = "https://projectApi.example.com";
  return new Backend(projectURL, {
    publishRepoOwner: "publish-repo-owner",
    publishRepo: "publish-repo",
    submoduleRepo: "submodule-repo",
    publishRepoBase: "publish-repo-main-branch",
    publishRepoToken: "publishRepoToken",
    gitSha: "publish-repo-git-sha",
  });
};

export const jsonToPromise = (json) => Promise.resolve(new Response(JSON.stringify(json)));
