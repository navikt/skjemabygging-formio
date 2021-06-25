import { fetchWithErrorHandling } from "./fetchUtils.js";

export class Backend {
  constructor(projectURL, githubAppConfig, gitVersion) {
    this.projectURL = projectURL;
    this.githubAppConfig = githubAppConfig;
    this.gitVersion = gitVersion;
  }

  ho() {
    return "flups";
  }

  getProjectURL() {
    return this.projectURL;
  }

  getGitURL() {
    return this.githubAppConfig.workflowDispatchURL;
  }

  payload(formJsonFileTitle, form, translations) {
    return {
      ref: this.githubAppConfig.workflowDispatchRef,
      inputs: {
        formJsonFileTitle,
        translationJson: JSON.stringify(translations),
        formJson: JSON.stringify(form),
        monorepoGitHash: this.gitVersion,
      },
    };
  }

  async checkPublishingAccess(userToken) {
    //Her kan vi vurdere nærmere sjekk, men man når ikke denne siden uten å være pålogget.
    const currentUserUrl = `${this.projectURL}/current`;
    console.log("project url", currentUserUrl);
    return fetchWithErrorHandling(currentUserUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": userToken,
      },
    });
  }

  async publishForm(userToken, form, translations, formPath) {
    console.log("got here");
    await this.checkPublishingAccess(userToken);
    console.log("got there, token", this.githubAppConfig.workflowDispatchToken);
    return await fetchWithErrorHandling(this.githubAppConfig.workflowDispatchURL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "Application/JSON",
        Authorization: `token ${this.githubAppConfig.workflowDispatchToken}`,
      },
      body: JSON.stringify(this.payload(formPath, form, translations)),
    });
  }
}
