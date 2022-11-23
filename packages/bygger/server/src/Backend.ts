import { I18nTranslations, NavFormType, ResourceContent } from "@navikt/skjemadigitalisering-shared-domain";
import { PushEvent } from "@octokit/webhooks-types";
import { v4 as uuidv4 } from "uuid";
import { ConfigType } from "./config/types";
import { base64ToString, fetchWithErrorHandling } from "./fetchUtils";
import { GitHubRepo } from "./GitHubRepo.js";
import {
  createFileForPushingToRepo,
  deleteFilesAndUpdateMonorepoRefCallback,
  getFormFilePath,
  getTranslationFilePath,
  performChangesOnSeparateBranch,
  pushFilesAndUpdateMonorepoRefCallback,
} from "./repoUtils.js";
import { FormioService } from "./services/formioService";

const BULK_PUBLISH_REGEXP = /^\[bulk-publisering\] (\d+) skjemaer publisert, monorepo ref: (.*)$/;
const PUBLISH_REGEXP = /^\[publisering\] skjema \"(.*)\", monorepo ref: (.*)$/;
const UNPUBLISH_REGEXP = /^\[avpublisering\] skjema (.*), monorepo ref: (.*)$/;

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
      pushFilesAndUpdateMonorepoRefCallback(files, this.config.gitSha),
      `[publisering] skjema "${formFile.name}", monorepo ref: ${this.config.gitSha}`
    );
  }

  async unpublishForm(formPath: string) {
    return performChangesOnSeparateBranch(
      this.skjemaUtfylling,
      this.config.publishRepo.base,
      `unpublish-${formPath}--${uuidv4()}`,
      deleteFilesAndUpdateMonorepoRefCallback([getFormFilePath(formPath), getTranslationFilePath(formPath)]),
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
      pushFilesAndUpdateMonorepoRefCallback([resourceFile], this.config.gitSha),
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
      pushFilesAndUpdateMonorepoRefCallback(formFiles, this.config.gitSha),
      `[bulk-publisering] ${formFiles.length} skjemaer publisert, monorepo ref: ${this.config.gitSha}`
    );
  }

  interpretGithubPushEvent(pushEvent: PushEvent, type: string) {
    const success = type === "success";
    const thisCommit = pushEvent.head_commit;
    const commitMessage = thisCommit?.message || "";

    const titleRegexp = new RegExp(PUBLISH_REGEXP, "g");
    const publishFormTitleMatch = titleRegexp.exec(commitMessage);
    const unpublishRegexp = new RegExp(UNPUBLISH_REGEXP, "g");
    const unpublishFormPathMatch = unpublishRegexp.exec(commitMessage);
    const amountRegexp = new RegExp(BULK_PUBLISH_REGEXP, "g");
    const buldPublishCountMatch = amountRegexp.exec(commitMessage);

    if (publishFormTitleMatch) {
      return {
        type,
        title: success ? "Publisering fullført" : "Publisering feilet",
        message: success
          ? `Skjema ${publishFormTitleMatch[1]} er nå publisert`
          : `Feilet for skjema ${publishFormTitleMatch[1]}`,
      };
    }
    if (unpublishFormPathMatch) {
      return {
        type,
        title: success ? "Avpublisering fullført" : "Avpublisering feilet",
        message: success
          ? `Skjema ${unpublishFormPathMatch[1]} er nå avpublisert`
          : `Feilet for skjema ${unpublishFormPathMatch[1]}`,
      };
    }
    if (buldPublishCountMatch) {
      return {
        type,
        title: success ? "Bulk-publisering fullført" : "Bulk-publisering feilet",
        message: success
          ? `${buldPublishCountMatch[1]} skjemaer ble bulk-publisert`
          : `${buldPublishCountMatch[1]} skjemaer feilet`,
      };
    }
    return {
      type,
      title: success ? "Ny versjon av FyllUt" : "Deploy av FyllUt feilet",
      message: commitMessage,
    };
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
