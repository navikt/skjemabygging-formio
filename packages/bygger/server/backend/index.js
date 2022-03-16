import { Octokit } from "octokit";
import qs from "qs";
import { promisify } from "util";
import { gunzip, gzip } from "zlib";
import { fetchWithErrorHandling, stringTobase64 } from "./fetchUtils.js";
const promisifiedGzip = promisify(gzip);
const promisifiedGunzip = promisify(gunzip);

export class Backend {
  constructor(projectURL, config) {
    this.projectURL = projectURL;
    this.config = config;
    this.octokit = new Octokit({ auth: config.workflowDispatchToken });
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
    const updateFormUrl = "https://formio-api-server.ekstern.dev.nav.no/form";
    await this.checkUpdateAndPublishingAccess(userToken);
    return await Promise.all(
      forms.map((form) => {
        return fetchWithErrorHandling(`${updateFormUrl}/${form._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-jwt-token": userToken,
          },
          body: JSON.stringify(form),
        }).then((migratedForm) => migratedForm.data);
      })
    );
  }

  async getRemoteFileShaIfItExists(owner, repo, ref, path) {
    let remoteFileContent;
    try {
      remoteFileContent = await this.octokit.rest.repos.getContent({ owner, repo, ref, path });
    } catch (e) {}
    if (remoteFileContent && remoteFileContent.data && remoteFileContent.data.sha) {
      return remoteFileContent.data.sha;
    }
    return undefined;
  }

  async pushJsonFileToRepo(owner, repo, branch, path, message, file) {
    const content = stringTobase64(JSON.stringify(file), "utf-8");
    const sha = await this.getRemoteFileShaIfItExists(owner, repo, branch, path);
    const params = {
      owner,
      repo,
      branch,
      path,
      message,
      content,
    };
    if (sha) {
      return await this.octokit.rest.repos.createOrUpdateFileContents({ ...params, sha });
    }
    return await this.octokit.rest.repos.createOrUpdateFileContents(params);
  }

  async publishForm(userToken, form, translations, formPath) {
    await this.checkUpdateAndPublishingAccess(userToken);
    await this.pushJsonFileToRepo(
      "navikt",
      "skjemapublisering-monorepo-poc",
      "test-publish",
      `translations/${formPath}.json`,
      `Publishing translations for ${formPath}`,
      translations
    );
    return this.pushJsonFileToRepo(
      "navikt",
      "skjemapublisering-monorepo-poc",
      "test-publish",
      `forms/${formPath}.json`,
      `Publishing form: ${form.properties.skjemanummer} - ${form.title}`,
      form
    );
  }

  async publishResource(userToken, resourceName, resourceContent) {
    await this.checkUpdateAndPublishingAccess(userToken);
    return this.pushJsonFileToRepo(
      "navikt",
      "skjemapublisering-monorepo-poc",
      "test-publish",
      `forms/${resourceName}.json`,
      `Publishing resource: ${resourceName}`,
      resourceContent
    );
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
      return fetchWithErrorHandling(`${this.config.skjemabyggingProxyUrl}/norg2/api/v1/enhet?enhetStatusListe=AKTIV`, {
        headers: { Authorization: `Bearer ${data?.access_token}` },
      }).then((response) => response.data);
    });
  }
}
