import { fetchWithErrorHandling } from "./fetchUtils.js";
import { promisify } from "util";
import { deflate, unzip } from "zlib";
const promisifiedDeflate = promisify(deflate);

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

  async compressAndEncode(data) {
    const buffer = Buffer.from(JSON.stringify(data), "utf-8");
    const zippedBuffer = await promisifiedDeflate(buffer);
    return zippedBuffer.toString("base64");
  }

  async payload(formJsonFileTitle, form, translations) {
    const encodedForm = await this.compressAndEncode(form);
    return {
      ref: this.githubAppConfig.workflowDispatchRef,
      inputs: {
        formJsonFileTitle,
        translationJson: JSON.stringify(translations),
        formJson: encodedForm,
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
    const payload = await this.payload(formPath, form, translations);
    return await fetchWithErrorHandling(this.githubAppConfig.workflowDispatchURL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "Application/JSON",
        Authorization: `token ${this.githubAppConfig.workflowDispatchToken}`,
      },
      body: JSON.stringify(payload),
    });
  }
}
