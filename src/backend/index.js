import {
  PublishingService,
  checkPublishingAccess,
  getGithubToken,
} from "./publishingService.js";

export class Backend {
  constructor(projectURL, githubAppConfig, gitVersion) {
    this.projectURL = projectURL;
    this.githubAppConfig = githubAppConfig;
    this.gitVersion = gitVersion;
  }

  getProjectURL() {
    return this.projectURL;
  }

  getGitURL() {
    return this.githubAppConfig.baseURL;
  }

  async publishForm(userToken, form, formPath) {
    const access = await checkPublishingAccess(userToken, this.projectURL);
    if (access.status !== "OK") {
      return access;
    }

    const githubTokenResponse = await getGithubToken(this.githubAppConfig);
    if (githubTokenResponse.status !== "OK") {
      return {status: "FAILED"};
    }

    const githubToken = githubTokenResponse.data.token;
    const service = new PublishingService(
      githubToken,
      `${this.githubAppConfig.baseURL}repos/navikt/skjemapublisering-test`,
      this.githubAppConfig.gitRef
    );
    const resp2 = await service.publishForm(formPath, form);
    console.log(resp2);
    if (resp2.status !== "OK") {
      return resp2;
    }
    const resp3 = await service.updatePackageJson(this.gitVersion);
    console.log(resp3);
    return await service.updateFromAndDeleteTempRef();
  }

}
