import { I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { Backend } from '../Backend';
import { logger } from '../logging/logger';
import { ApiError } from '../routers/api/helpers/errors';

class PublisherService {
  private readonly backend: Backend;

  constructor(backend: Backend) {
    this.backend = backend;
  }

  async publishForm(form: NavFormType, translations: I18nTranslations | undefined) {
    try {
      const publishResult = await this.backend.publishForm(form, translations, form.path);
      return { changed: !!publishResult, form };
    } catch (error) {
      logger.error(`Error occurred while trying to publish form with path ${form.path}`, {
        error,
      });
      throw new ApiError('Publisering feilet', true, error as Error);
    }
  }

  async unpublishForm(form: NavFormType) {
    try {
      const gitSha = await this.backend.unpublishForm(form.path);
      return { changed: !!gitSha, form };
    } catch (error) {
      throw new ApiError('Avpublisering feilet', true, error as Error);
    }
  }

  async publishForms(forms: NavFormType[]) {
    try {
      return await this.backend.publishForms(forms);
    } catch (error) {
      throw new ApiError('Bulk-publisering feilet', true, error as Error);
    }
  }
}

export default PublisherService;
