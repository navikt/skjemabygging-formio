import { I18nTranslations, NavFormType, ResourceContent } from "@navikt/skjemadigitalisering-shared-domain";
import { v4 as uuidv4 } from "uuid";
import { ConfigType } from "./config/types";
import { base64ToString, fetchWithErrorHandling } from "./fetchUtils";
import { GitHubRepo } from "./GitHubRepo.js";
import {
  createFileForPushingToRepo,
  deleteFilesAndUpdateSubmoduleCallback,
  getFormFilePath,
  getTranslationFilePath,
  performChangesOnSeparateBranch,
  pushFilesAndUpdateSubmoduleCallback,
} from "./repoUtils.js";
import { FormioService } from "./services/formioService";

export class Backend {
  private readonly skjemaUtfylling: GitHubRepo;
  private readonly config: ConfigType;
  private readonly formioService: FormioService;

  constructor(config: ConfigType, formioService: FormioService) {
    this.config = config;
    this.formioService = formioService;
    this.skjemaUtfylling = new GitHubRepo(config.publishRepo.owner, config.publishRepo.name, config.publishRepo.token);
  }

  async publishForm(formContent: NavFormType, translationsContent: I18nTranslations | undefined, formPath: string) {
    const formFile = createFileForPushingToRepo(formContent.title, getFormFilePath(formPath), "skjema", formContent);
    const files = [formFile];

    if (translationsContent) {
      const translationsFile = createFileForPushingToRepo(
        formContent.title,
        getTranslationFilePath(formPath),
        "oversettelse",
        translationsContent
      );
      files.push(translationsFile);
    }

    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepo.base,
      `publish-${formPath}--${uuidv4()}`,
      pushFilesAndUpdateSubmoduleCallback(files, this.config.gitSha, this.config.publishRepo.submoduleName),
      `[publisering] skjema "${formFile.name}", monorepo ref: ${this.config.gitSha}`
    );
  }

  async unpublishForm(userToken: string, formPath: string) {
    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepo.base,
      `unpublish-${formPath}--${uuidv4()}`,
      deleteFilesAndUpdateSubmoduleCallback([getFormFilePath(formPath), getTranslationFilePath(formPath)]),
      `[avpublisering] skjema ${formPath}, monorepo ref: ${this.config.gitSha}`
    );
  }

  async publishResource(resourceName: string, resourceContent: ResourceContent) {
    const resourceFile = createFileForPushingToRepo(
      resourceName,
      `resources/${resourceName}.json`,
      "ressurs",
      resourceContent
    );

    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepo.base,
      `publish-${resourceName}--${uuidv4()}`,
      pushFilesAndUpdateSubmoduleCallback([resourceFile], this.config.gitSha, this.config.publishRepo.submoduleName),
      `[resources] publiserer ${resourceName}, monorepo ref: ${this.config.gitSha}`
    );
  }

  async bulkPublishForms(formPaths: string[]) {
    const forms = await this.formioService.getForms(formPaths);
    return this.publishForms(forms);
  }

  async publishForms(forms: NavFormType[]) {
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

  async fetchEnhetsliste() {
    return fetchWithErrorHandling(`${this.config.fyllut.baseUrl}/api/enhetsliste`, {
      method: "GET",
    }).then((response) => response.data);
  }

  async fetchPublishedForm(formPath: string) {
    const filePath = getTranslationFilePath(formPath);
    const response = await this.skjemaUtfylling.getFileIfItExists(this.config.publishRepo.base || "master", filePath);
    if (response && "content" in response.data) {
      const content = base64ToString(response.data.content);
      return JSON.parse(content);
    }
  }
}
