import qs from "qs";
import { v4 as uuidv4 } from "uuid";
import { fetchWithErrorHandling } from "./fetchUtils.js";
import { GitHubRepo } from "./GitHubRepo.js";
import {
  createFileForPushingToRepo,
  performChangesOnSeparateBranch,
  pushFilesAndUpdateSubmoduleCallback,
} from "./repoUtils.js";

export class Backend {
  constructor(projectURL, config) {
    this.projectURL = projectURL;
    this.config = config;
    this.skjemaUtfylling = new GitHubRepo(config.publishRepoOwner, config.publishRepo, config.publishRepoToken);
  }

  ho() {
    return "flups";
  }

  getProjectURL() {
    return this.projectURL;
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

  async fetchFromProjectApi(path) {
    const response = await fetchWithErrorHandling(`${this.projectURL}${path}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }

  async getForm(formPath) {
    const formData = await this.fetchFromProjectApi(`/form?type=form&path=${formPath}&limit=1`);
    return formData[0];
  }

  async getForms(formPaths, limit = 1000) {
    return this.fetchFromProjectApi(`/form?type=form&path__in=${formPaths.toString()}&limit=${limit}`);
  }

  async getAllForms(limit = 1000, excludeDeleted = true) {
    return this.fetchFromProjectApi(`/form?type=form${excludeDeleted ? "&tags=nav-skjema" : ""}&limit=${limit}`);
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

  async publishForm(userToken, formContent, translationsContent, formPath) {
    const formFile = createFileForPushingToRepo(formContent.title, `forms/${formPath}.json`, "skjema", formContent);
    const translationsFile = createFileForPushingToRepo(
      formContent.title,
      `translations/${formPath}.json`,
      "oversettelse",
      translationsContent
    );

    await this.checkUpdateAndPublishingAccess(userToken);
    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepoBase,
      `publish-${formPath}--${uuidv4()}`,
      pushFilesAndUpdateSubmoduleCallback([translationsFile, formFile], this.config.gitSha, this.config.submoduleRepo),
      `[publisering] skjema "${formFile.name}", monorepo ref: ${this.config.gitSha}`
    );
  }

  async publishResource(userToken, resourceName, resourceContent) {
    const resourceFile = createFileForPushingToRepo(
      resourceName,
      `resources/${resourceName}.json`,
      "ressurs",
      resourceContent
    );

    await this.checkUpdateAndPublishingAccess(userToken);
    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepoBase,
      `publish-${resourceName}--${uuidv4()}`,
      pushFilesAndUpdateSubmoduleCallback([resourceFile], this.config.gitSha, this.config.submoduleRepo),
      `[resources] publiserer ${resourceName}, monorepo ref: ${this.config.gitSha}`
    );
  }

  async bulkPublishForms(userToken, formPaths) {
    await this.checkUpdateAndPublishingAccess(userToken);
    const forms = await this.getForms(formPaths);
    const formFiles = forms.map((formContent) =>
      createFileForPushingToRepo(formContent.title, `forms/${formContent.path}.json`, "skjema", formContent)
    );

    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepoBase,
      `bulkpublish--${uuidv4()}`,
      pushFilesAndUpdateSubmoduleCallback(formFiles, this.config.gitSha, this.config.submoduleRepo),
      `[bulk-publisering] ${formFiles.length} skjemaer publisert, monorepo ref: ${this.config.gitSha}`
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
