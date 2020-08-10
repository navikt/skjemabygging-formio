import {
  checkPublishingAccess,
  getListOfPreviouslyPublishedForms,
  getShaIfFormIsPreviouslyPublished,
  publishUpdateToForm,
  publishNewForm,
  getGithubToken,
} from "./publishingService.js";

export class Backend {
  constructor(projectURL, gitUrl, ghKey, ghAppID, ghInstallationID) {
    this.projectURL = projectURL;
    this.gitUrl = gitUrl;
    this.ghKey = ghKey;
    this.ghAppID = ghAppID;
    this.ghInstallationID = ghInstallationID;
  }

  ho() {
    return { message: "ho" };
  }

  getProjectURL() {
    return this.projectURL;
  }

  async publishForm(userToken, form, formPath) {
    const access = await checkPublishingAccess(userToken, this.getProjectURL());
    if (access.status !== "OK") {
      return access;
    }

    const githubTokenResponse = await getGithubToken(this.ghAppID, this.ghKey, this.ghInstallationID, this.gitUrl);
    if (githubTokenResponse.status !== "OK") {
      return githubTokenResponse;
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
