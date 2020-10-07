import { checkPublishingAccess, getGithubToken, getShaIfFormIsPreviouslyPublished } from "./publishingService.js";
import { PublishingService } from "./publishingService";

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
      return { status: "FAILED" };
    }

    const githubToken = githubTokenResponse.data.token;
    const service = new PublishingService(
      githubToken,
      `${this.githubAppConfig.baseURL}repos/navikt/skjemapublisering-test`,
      this.githubAppConfig.gitRef
    );
    const listOfFormsResponse = await service.getListOfPreviouslyPublishedForms();

    if (listOfFormsResponse.status !== "OK") {
      return { status: "FAILED" };
    }

    const formFileName = `${formPath}.json`;
    const listOfForms = listOfFormsResponse.data;
    const shaOfPreviouslyPublishedForm = getShaIfFormIsPreviouslyPublished(listOfForms, formFileName);
    // console.log("forms", listOfForms);
    if (shaOfPreviouslyPublishedForm) {
      return service.publishUpdateToForm(formFileName, form, shaOfPreviouslyPublishedForm);
    } else {
      return service.publishNewForm(formFileName, form);
    }
  }
}
