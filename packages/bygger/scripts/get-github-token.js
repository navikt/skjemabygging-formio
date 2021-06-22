import { getGithubToken } from "../src/backend/publishingService.js";

const githubAppConfig = {
  gitRef: "koselig-med-peis",
  baseURL: "https://api.github.com/",
  key: process.env.GITHUB_KEY,
  appID: process.env.GITHUB_PUBLISHING_APP_ID,
  installationID: process.env.GITHUB_PUBLISHING_INSTALLATION_ID,
};

const asyncFunction = async () => {
  const githubTokenResponse = await getGithubToken(githubAppConfig);
  if (githubTokenResponse.status !== "OK") {
    console.log('faiiled', githubTokenResponse);
    return -1;
  }

  const githubToken = githubTokenResponse.data.token;
  console.log('token ', githubToken);
}

asyncFunction().then(() => console.log('done'));
