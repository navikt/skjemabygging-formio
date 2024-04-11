import { FormioTranslationPayload } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../logging/logger';
import { ApiError } from '../../routers/api/helpers/errors';
import { FormioService } from '../formioService';
import { CopyService } from './types';

export const createCopyService = (
  formioServiceSource: FormioService,
  formioServiceTarget: FormioService,
): CopyService => ({
  form: async (formPath, token, username) => {
    const logMeta = {
      formPath,
      username,
      source: formioServiceSource.projectUrl,
      target: formioServiceTarget.projectUrl,
    };
    logger.info(`Will overwrite form ${formPath} with data from source...`, logMeta);

    const sourceForm = await formioServiceSource.getForm(formPath);
    if (!sourceForm) {
      logger.info(`Form ${formPath} not found in source`, logMeta);
      throw new ApiError('Fant ikke skjemaet som skulle kopieres', true);
    }

    const targetForm = await formioServiceTarget.getForm(formPath);
    targetForm.title = sourceForm.title;
    targetForm.properties = sourceForm.properties;
    targetForm.components = sourceForm.components;
    const savedForm = await formioServiceTarget.saveForm(targetForm, token, username, sourceForm.properties);
    logger.info(`Form ${formPath} copied to target`, logMeta);

    const sourceTranslations = await formioServiceSource.getTranslations(formPath);
    logger.debug(`Found ${sourceTranslations.length} translation objects for form ${formPath} in source`, {
      ...logMeta,
      sourceTranslationIds: sourceTranslations.map((t) => t._id),
    });
    await formioServiceTarget.deleteTranslations(formPath, token);

    if (sourceTranslations.length > 0) {
      logger.info(`Will overwrite translations for form ${formPath} with data from source...`, logMeta);
      const languageForm = await formioServiceTarget.getForm('language', 'resource');
      if (languageForm) {
        const translations = sourceTranslations.map((t) => {
          return {
            data: t.data,
            form: languageForm._id,
            project: targetForm.project,
          };
        }) as FormioTranslationPayload[];
        const savedTranslations = await formioServiceTarget.saveTranslations(translations, token);
        logger.info(`Translations for form ${formPath} copied to target`, {
          ...logMeta,
          targetTranslationIds: savedTranslations.map((t) => t._id),
        });
      } else {
        logger.warn(
          `Unable to locate form 'language' in target when trying to copy translations for form ${formPath}`,
          logMeta,
        );
      }
    } else {
      logger.info(`No translations for form ${formPath} found in source`);
    }
    return savedForm;
  },
});
