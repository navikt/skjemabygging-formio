import {
  dateUtils,
  FormPropertiesPublishing,
  I18nTranslations,
  NavFormType,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Backend } from '../Backend';
import { logger } from '../logging/logger';
import { ApiError } from '../routers/api/helpers/errors';
import { FormioService } from './formioService';

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
    let formWithPublishProps: NavFormType | undefined;
    try {
      const publishedLanguages = translations ? Object.keys(translations) : undefined;
      const now = dateUtils.getIso8601String();
      const formProps = createPublishProps(now, userName, publishedLanguages);
      logger.debug('Save form before publishing', { formPath: form.path, ...formProps });
      formWithPublishProps = await this.formioService.saveForm(form, formioToken, userName, formProps);
      const publishResult = await this.backend.publishForm(formWithPublishProps, translations, form.path);
      return { changed: !!publishResult, form: formWithPublishProps };
    } catch (error) {
      logger.error('Error occurred while trying to publish form', { error, formPath: form.path });
      if (formWithPublishProps) {
        logger.debug('Rolling back props since publishing failed', { formPath: form.path });
        const rollbackFormProps = createRollbackProps(form);
        try {
          await this.formioService.saveForm(formWithPublishProps, formioToken, userName, rollbackFormProps);
        } catch (innerError: any) {
          logger.warn('Failed rollback attempt while publishing form', {
            formPath: form.path,
            errorMessage: innerError.message,
          });
        }
      }
      throw new ApiError('Publisering feilet', true, error as Error);
    }
  }

  async unpublishForm(form: NavFormType, opts: Opts) {
    const { userName, formioToken } = opts || {};
    const now = dateUtils.getIso8601String();

    let formWithUnpublishProps;
    try {
      const formProps = createUnpublishProps(now, userName);
      formWithUnpublishProps = await this.formioService.saveForm(form, formioToken, userName, formProps);
      const gitSha = await this.backend.unpublishForm(form.path);
      return { changed: !!gitSha, form: formWithUnpublishProps };
    } catch (error) {
      if (formWithUnpublishProps) {
        logger.debug('Rolling back props since unpublishing failed', { formPath: form.path });
        const rollbackFormProps = createRollbackProps(form);
        await this.formioService.saveForm(formWithUnpublishProps, formioToken, userName, rollbackFormProps);
      }
      throw new ApiError('Avpublisering feilet', true, error as Error);
    }
  }

  async publishForms(forms: NavFormType[], opts: Opts) {
    const now = dateUtils.getIso8601String();
    const { userName, formioToken } = opts || {};

    const publications: Publication[] = [];
    let gitSha;
    try {
      await Promise.allSettled(
        forms.map(async (originalForm) => {
          const formProps = createPublishProps(now, userName);
          const formWithPublishProps = await this.formioService.saveForm(
            originalForm,
            formioToken,
            userName,
            formProps,
            true,
          );
          return {
            originalForm,
            formWithPublishProps,
          };
        }),
      ).then((results) => {
        const errs: Record<string, Error> = {};
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            publications.push(result.value);
          } else {
            const err = result.reason;
            const { message, stack, ...errDetails } = err;
            const logMeta = { reason: message, stack, ...errDetails };
            const form = forms[index];
            logger.error(`Failed to update props for ${form.path}`, logMeta);
            errs[form.path] = err;
          }
        });
        const failedUpdates = Object.keys(errs);
        if (failedUpdates.length > 0) {
          const err = new Error(`Failed to update props for ${failedUpdates.length} form(s)`);
          err['failedFormPaths'] = failedUpdates;
          throw err;
        }
      });
      gitSha = await this.backend.publishForms(publications.map((pub) => pub.formWithPublishProps));
    } catch (error: any) {
      logger.error(`Error during publishForms, rolling back props for ${publications.length} form(s)`, {
        reason: error.message,
        failedFormPaths: error.failedFormPaths ?? 'unknown',
        rollbackFormPaths: publications?.map((p) => p.originalForm.path),
      });
      if (publications.length) {
        await Promise.allSettled(
          publications.map((pub) => {
            const { originalForm, formWithPublishProps } = pub;
            const rollbackFormProps = createRollbackProps(originalForm);
            return this.formioService.saveForm(formWithPublishProps, formioToken, userName, rollbackFormProps);
          }),
        ).then((results) => {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              const err = result.reason;
              const { message, stack, ...errDetails } = err;
              const logMeta = { reason: message, stack, ...errDetails };
              logger.warn(`Failed to rollback props for ${publications[index].originalForm.path}`, logMeta);
            }
          });
        });
      }
      throw new ApiError('Bulk-publisering feilet', true, error as Error);
    }
    return gitSha;
  }
}

const createPublishProps = (
  now: string,
  userName: string,
  publishedLanguages?: string[] | undefined,
): FormPropertiesPublishing => ({
  modified: now,
  modifiedBy: userName,
  published: now,
  publishedBy: userName,
  unpublished: undefined,
  unpublishedBy: undefined,
  ...(publishedLanguages && { publishedLanguages }),
});

const createUnpublishProps = (now: string, userName: string): FormPropertiesPublishing => ({
  modified: now,
  modifiedBy: userName,
  published: undefined,
  publishedBy: undefined,
  unpublished: now,
  unpublishedBy: userName,
  publishedLanguages: [],
});

const createRollbackProps = (originalForm: NavFormType): FormPropertiesPublishing => ({
  ...originalForm.properties,
  modified: originalForm.properties?.modified,
  modifiedBy: originalForm.properties?.modifiedBy,
  published: originalForm.properties?.published,
  publishedBy: originalForm.properties?.publishedBy,
  unpublished: originalForm.properties?.unpublished,
  unpublishedBy: originalForm.properties?.unpublishedBy,
  publishedLanguages: originalForm.properties?.publishedLanguages,
});

interface Publication {
  originalForm: NavFormType;
  formWithPublishProps: NavFormType;
}

export default PublisherService;
