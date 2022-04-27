import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import qs from "qs";
import { v4 as uuidv4 } from "uuid";
import { ConfigType } from "./config/types";
import { fetchWithErrorHandling } from "./fetchUtils";
import { GitHubRepo } from "./GitHubRepo.js";
import {
  createFileForPushingToRepo,
  performChangesOnSeparateBranch,
  pushFilesAndUpdateSubmoduleCallback,
} from "./repoUtils.js";

export class Backend {
  private readonly skjemaUtfylling: GitHubRepo;
  private readonly config: ConfigType;

  constructor(config: ConfigType) {
    this.config = config;
    this.skjemaUtfylling = new GitHubRepo(config.publishRepo.owner, config.publishRepo.name, config.publishRepo.token);
  }

  async checkUpdateAndPublishingAccess(userToken: string) {
    //Her kan vi vurdere nærmere sjekk, men man når ikke denne siden uten å være pålogget.
    const currentUserUrl = `${this.config.formio.projectUrl}/current`;
    return fetchWithErrorHandling(currentUserUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": userToken,
      },
    });
  }

  async fetchFromProjectApi(path: string) {
    const response = await fetchWithErrorHandling(`${this.config.formio.projectUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }

  async getForm(formPath: string) {
    const formData = await this.fetchFromProjectApi(`/form?type=form&path=${formPath}&limit=1`);
    return formData[0];
  }

  async getForms(formPaths: string[], limit = 1000) {
    return this.fetchFromProjectApi(`/form?type=form&path__in=${formPaths.toString()}&limit=${limit}`);
  }

  async getAllForms(limit = 1000, excludeDeleted = true) {
    return this.fetchFromProjectApi(`/form?type=form${excludeDeleted ? "&tags=nav-skjema" : ""}&limit=${limit}`);
  }

  async updateForms(userToken: string, forms: NavFormType[]) {
    const updateFormUrl = `${this.config.formio.projectUrl}/form`;
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

  async publishForm(userToken: string, formContent: NavFormType, translationsContent: any, formPath: string) {
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
      this.config.publishRepo.base,
      `publish-${formPath}--${uuidv4()}`,
      pushFilesAndUpdateSubmoduleCallback(
        [translationsFile, formFile],
        this.config.gitSha,
        this.config.publishRepo.submoduleName
      ),
      `[publisering] skjema "${formFile.name}", monorepo ref: ${this.config.gitSha}`
    );
  }

  async publishResource(userToken: string, resourceName: string, resourceContent: any) {
    const resourceFile = createFileForPushingToRepo(
      resourceName,
      `resources/${resourceName}.json`,
      "ressurs",
      resourceContent
    );

    await this.checkUpdateAndPublishingAccess(userToken);
    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepo.base,
      `publish-${resourceName}--${uuidv4()}`,
      pushFilesAndUpdateSubmoduleCallback([resourceFile], this.config.gitSha, this.config.publishRepo.submoduleName),
      `[resources] publiserer ${resourceName}, monorepo ref: ${this.config.gitSha}`
    );
  }

  async bulkPublishForms(userToken: string, formPaths: string[]) {
    await this.checkUpdateAndPublishingAccess(userToken);
    const forms = await this.getForms(formPaths);
    const formFiles = forms.map((formContent: NavFormType) =>
      createFileForPushingToRepo(formContent.title, `forms/${formContent.path}.json`, "skjema", formContent)
    );

    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepo.base,
      `bulkpublish--${uuidv4()}`,
      pushFilesAndUpdateSubmoduleCallback(formFiles, this.config.gitSha, this.config.publishRepo.submoduleName),
      `[bulk-publisering] ${formFiles.length} skjemaer publisert, monorepo ref: ${this.config.gitSha}`
    );
  }

  async authenticateWithAzure() {
    const postData = {
      grant_type: "client_credentials",
      scope: `openid api://${this.config.skjemabyggingProxy.clientId}/.default`,
      client_id: this.config.azure.clientId,
      client_secret: this.config.azure.clientSecret,
      client_auth_method: "client_secret_basic",
    };
    const body = qs.stringify(postData);
    return fetchWithErrorHandling(this.config.azure.openidTokenEndpoint, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: body,
    });
  }

  async fetchEnhetsliste() {
    return this.authenticateWithAzure().then(({ data }) => {
      return fetchWithErrorHandling(`${this.config.skjemabyggingProxy.url}/norg2/api/v1/enhet?enhetStatusListe=AKTIV`, {
        headers: { Authorization: `Bearer ${data?.access_token}` },
      }).then((response) => response.data);
    });
  }
}
