import { PublishingService, checkPublishingAccess, getGithubToken } from "./publishingService.js";

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
    await checkPublishingAccess(userToken, this.projectURL);
    const githubTokenResponse = await getGithubToken(this.githubAppConfig);
    const githubToken = githubTokenResponse.data.token;
    const service = new PublishingService(
      githubToken,
      `${this.githubAppConfig.baseURL}repos/navikt/skjemapublisering`,
      this.githubAppConfig.gitRef
    );
    await service.createTempCopyOfGitRef();
    try {
      await service.publishForm(formPath, form);
      await service.updatePackageJson(this.gitVersion);
    } finally {
      await service.updateFromAndDeleteTempRef();
    }
  }
}
