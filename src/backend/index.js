import {
  checkPublishingAccess,
  getListOfPreviouslyPublishedForms,
  getShaIfFormIsPreviouslyPublished,
  publishUpdateToForm,
  publishNewForm,
  getGithubToken,
} from "./publishingService.js";

export class Backend {
  constructor(projectURL, gitUrl, githubAppConfig, gitVersion) {
    this.projectURL = projectURL;
    this.gitUrl = gitUrl;
    this.githubAppConfig = githubAppConfig;
    this.gitVersion = gitVersion;
  }

  ho() {
    return { message: "ho" };
  }

  getProjectURL() {
    return this.projectURL;
  }

  getGitURL() {
    return this.gitUrl;
  }

  async publishForm(userToken, form, formPath) {
    const access = await checkPublishingAccess(userToken, this.projectURL);
    if (access.status !== "OK") {
      return access;
    }

    const githubTokenResponse = await getGithubToken(this.githubAppConfig, this.gitUrl);
    if (githubTokenResponse.status !== "OK") {
      return { status: "FAILED" };
    }

    const githubToken = githubTokenResponse.data.token;
    const skjemapubliseringGHUrl = `${this.gitUrl}repos/navikt/skjemapublisering-test/contents/skjema`;
    const listOfFormsResponse = await getListOfPreviouslyPublishedForms(skjemapubliseringGHUrl, githubToken);

    if (listOfFormsResponse.status !== "OK") {
      return { status: "FAILED" };
    }

    const formFileName = `${formPath}.json`;
    const listOfForms = listOfFormsResponse.data;
    const shaOfPreviouslyPublishedForm = getShaIfFormIsPreviouslyPublished(listOfForms, formFileName);
    if (shaOfPreviouslyPublishedForm) {
      return publishUpdateToForm(formFileName, form, shaOfPreviouslyPublishedForm, skjemapubliseringGHUrl, githubToken);
    } else {
      return publishNewForm(formFileName, form, skjemapubliseringGHUrl, githubToken);
    }
  }
}
