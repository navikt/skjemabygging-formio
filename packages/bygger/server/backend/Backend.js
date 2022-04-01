import { guid } from "nav-frontend-js-utils";
import qs from "qs";
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
      `publish-${formPath}--${guid()}`,
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
      `publish-${resourceName}--${guid()}`,
      pushFilesAndUpdateSubmoduleCallback([resourceFile], this.config.gitSha, this.config.submoduleRepo),
      `[resources] publiserer ${resourceName}`
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
