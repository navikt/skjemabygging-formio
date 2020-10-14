import {getGithubToken, PublishingService} from "../src/backend/publishingService.js";

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
    console.log('failed', githubTokenResponse);
    return -1;
  }

  const githubToken = githubTokenResponse.data.token;
  console.log('token ', githubToken);
  const repoUrl = `${githubAppConfig.baseURL}repos/navikt/skjemapublisering-test`;
  const service = new PublishingService(githubToken, repoUrl, githubAppConfig.gitRef);
  const response = await service.makeTempGitRef();
  console.log(response);
  const form = {flesk: "bacon"};
  const formFileName = 'fleskKraKraBacon.json';
  const resp2 = await service.publishForm(formFileName, form);
  console.log(resp2);
  const skjemabyggerSha = 'deadcafe';
  const resp3 = await service.updatePackageJson(skjemabyggerSha);
  console.log(resp3);
  service.updateFromAndDeleteTempRef();

}

asyncFunction().then(() => console.log('done'));
