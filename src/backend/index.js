import {
  checkPublishingAccess,
  getListOfPreviouslyPublishedForms,
  getShaIfFormIsPreviouslyPublished,
  publishUpdateToForm,
  publishNewForm,
} from "./publishingService.js";

export class Backend {
  constructor(projectURL, gitUrl, user, pass) {
    this.projectURL = projectURL;
    this.gitUrl = gitUrl;
    this.user = user;
    this.pass = pass;
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

    const listOfFormsResponse = await getListOfPreviouslyPublishedForms(this.gitUrl, this.user, this.pass);

    if (listOfFormsResponse.status !== "OK") {
      return { status: "FAILED" };
    }

    const formFileName = `${formPath}.json`;
    const listOfForms = listOfFormsResponse.data;
    const shaOfPreviouslyPublishedForm = getShaIfFormIsPreviouslyPublished(listOfForms, formFileName);
    if (shaOfPreviouslyPublishedForm) {
      return publishUpdateToForm(formFileName, form, shaOfPreviouslyPublishedForm, this.gitUrl, this.user, this.pass);
    } else {
      return publishNewForm(formFileName, form, this.gitUrl, this.user, this.pass);
    }
  }
}
