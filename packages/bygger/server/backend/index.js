import { fetchWithErrorHandling } from "./fetchUtils.js";
import { promisify } from "util";
import { gzip, gunzip } from "zlib";
const promisifiedGzip = promisify(gzip);
const promisifiedGunzip = promisify(gunzip);

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

  async toBase64GzipAndJson(data) {
    const buffer = Buffer.from(JSON.stringify(data), "utf-8");
    const zippedBuffer = await promisifiedGzip(buffer);
    return zippedBuffer.toString("base64");
  }

  async fromBase64GzipAndJson(string) {
    const buffer = Buffer.from(string, "base64");
    const inflated = await promisifiedGunzip(buffer);
    return JSON.parse(inflated.toString());
  }

  async payload(formJsonFileTitle, form, translations) {
    const encodedForm = await this.toBase64GzipAndJson(form);
    const encodedTranslations = await this.toBase64GzipAndJson(translations);
    return {
      ref: this.githubAppConfig.workflowDispatchRef,
      inputs: {
        formJsonFileTitle,
        formDescription: form.title,
        encodedTranslationJson: encodedTranslations,
        encodedFormJson: encodedForm,
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
    await this.checkPublishingAccess(userToken);
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
