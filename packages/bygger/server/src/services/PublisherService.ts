import {
  dateUtils,
  FormPropertiesPublishing,
  I18nTranslations,
  NavFormType,
} from "@navikt/skjemadigitalisering-shared-domain";
import { Backend } from "../Backend";
import { ApiError } from "../routers/api/helpers/errors";
import { FormioService } from "./formioService";

interface Opts {
  userName: string;
  formioToken: string;
}

class PublisherService {
  private readonly formioService: FormioService;
  private readonly backend: Backend;

  constructor(formioService: FormioService, backend: Backend) {
    this.formioService = formioService;
    this.backend = backend;
  }

  async publishForm(form: NavFormType, translations: I18nTranslations | undefined, opts: Opts) {
    const { userName, formioToken } = opts || {};
    let formWithPublishProps;
    try {
      const publishedLanguages = translations ? Object.keys(translations) : undefined;
      const now = dateUtils.getIso8601String();
      const formProps: FormPropertiesPublishing = {
        modified: now,
        modifiedBy: userName,
        published: now,
        publishedBy: userName,
        unpublished: undefined,
        unpublishedBy: undefined,
        ...(publishedLanguages && { publishedLanguages }),
      };
      formWithPublishProps = await this.formioService.saveForm(form, formioToken, userName, formProps);
      const publishResult = await this.backend.publishForm(formWithPublishProps, translations, form.path);
      return { changed: !!publishResult, form: formWithPublishProps };
    } catch (error) {
      if (formWithPublishProps) {
        const rollbackFormProps: FormPropertiesPublishing = {
          ...form.properties,
          modified: form.properties?.modified,
          modifiedBy: form.properties?.modifiedBy,
          published: form.properties?.published,
          publishedBy: form.properties?.publishedBy,
          publishedLanguages: form.properties?.publishedLanguages,
        };
        try {
          await this.formioService.saveForm(formWithPublishProps, formioToken, userName, rollbackFormProps);
        } catch (innerError: any) {
          console.warn(`Failed rollback attempt while publishing form ${form.path}: ${innerError.message}`);
        }
      }
      throw new ApiError("Publisering feilet", true, error as Error);
    }
  }
}

export default PublisherService;
