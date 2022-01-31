import qs from "qs";
import { promisify } from "util";
import { gunzip, gzip } from "zlib";
import { fetchWithErrorHandling } from "./fetchUtils.js";
const promisifiedGzip = promisify(gzip);
const promisifiedGunzip = promisify(gunzip);

export class Backend {
  constructor(projectURL, config) {
    this.projectURL = projectURL;
    this.config = config;
  }

  ho() {
    return "flups";
  }

  getProjectURL() {
    return this.projectURL;
  }

  getGitURL() {
    return this.config.workflowDispatchURL;
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
      ref: this.config.workflowDispatchRef,
      inputs: {
        formJsonFileTitle,
        formDescription: form.title,
        encodedTranslationJson: encodedTranslations,
        encodedFormJson: encodedForm,
        monorepoGitHash: this.config.gitSha,
      },
    };
  }

  async checkUpdateAndPublishingAccess(userToken) {
    //Her kan vi vurdere nærmere sjekk, men man når ikke denne siden uten å være pålogget.
    const currentUserUrl = `${this.projectURL}/current`;
    return fetchWithErrorHandling(currentUserUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": userToken,
      },
    });
  }

  async updateForms(userToken, forms) {
    const updateFormUrl = "https://protected-island-44773.herokuapp.com/form";
    await this.checkUpdateAndPublishingAccess(userToken);
    return forms.map((form) => {
      console.log("UpdateForms", form.path);
      return fetchWithErrorHandling(`${updateFormUrl}/${form._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-jwt-token": userToken,
        },
        body: JSON.stringify(form),
      }).then((migratedForm) => migratedForm);
    });
  }

  async publishForm(userToken, form, translations, formPath) {
    await this.checkUpdateAndPublishingAccess(userToken);
    const payload = await this.payload(formPath, form, translations);
    return await fetchWithErrorHandling(this.config.workflowDispatchURL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "Application/JSON",
        Authorization: `token ${this.config.workflowDispatchToken}`,
      },
      body: JSON.stringify(payload),
    });
  }

  async publishResource(userToken, resourceName, resourceContent) {
    await this.checkUpdateAndPublishingAccess(userToken);
    const encodedResourceContent = await this.toBase64GzipAndJson(resourceContent);
    const payload = {
      ref: this.config.workflowDispatchRef,
      inputs: {
        resourceName,
        encodedJson: encodedResourceContent,
      },
    };
    return await fetchWithErrorHandling(this.config.publishResourceUrl, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "Application/JSON",
        Authorization: `token ${this.config.workflowDispatchToken}`,
      },
      body: JSON.stringify(payload),
    });
  }

  async authenticateWithAzure() {
    const postData = {
      grant_type: "client_credentials",
      scope: `openid api://${this.config.skjemabyggingProxyClientId}/.default`,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      client_auth_method: "client_secret_basic",
    };
    const body = qs.stringify(postData);
    return fetchWithErrorHandling(this.config.azureOpenidTokenEndpoint, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: body,
    });
  }

  async fetchEnhetsliste() {
    return this.authenticateWithAzure().then(({ data }) => {
      return fetchWithErrorHandling(
        `${this.config.skjemabyggingProxyUrl}/norg2/api/v1/enhet/kontaktinformasjon/organisering/AKTIV`,
        {
          headers: { consumerId: "skjemadigitalisering", Authorization: `Bearer ${data?.access_token}` },
        }
      ).then((response) => response.data);
    });
  }
}
