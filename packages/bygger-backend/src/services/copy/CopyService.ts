import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../logging/logger';
import { ApiError } from '../../routers/api/helpers/errors';
import { FormsService } from '../forms/types';
import { FormTranslationService, GlobalTranslationService } from '../translation/types';
import { CopyService } from './types';

export const createCopyService = (
  formsServiceSource: FormsService,
  formsServiceTarget: FormsService,
  formTranslationServiceSource: FormTranslationService,
  formTranslationServiceTarget: FormTranslationService,
  globalTranslationServiceSource: GlobalTranslationService,
  globalTranslationServiceTarget: GlobalTranslationService,
): CopyService => ({
  form: async (formPath, token, username) => {
    const logMeta = {
      formPath,
      username,
      source: formsServiceSource.formsUrl,
      target: formsServiceTarget.formsUrl,
    };
    logger.info(`Will overwrite form ${formPath} with data from source...`, logMeta);

    const sourceForm = await formsServiceSource.get(formPath);
    if (!sourceForm) {
      logger.info(`Form ${formPath} not found in source`, logMeta);
      throw new ApiError('Fant ikke skjemaet som skulle kopieres', true);
    }

    let targetForm: Form | undefined = undefined;
    try {
      targetForm = await formsServiceTarget.get(formPath);
    } catch (err: any) {
      logger.info(`Could not fetch target form: ${err.message}`);
    }
    let savedForm: Form | undefined;
    if (!targetForm) {
      const createFormRequest = {
        skjemanummer: sourceForm.properties.skjemanummer,
        title: sourceForm.title,
        components: sourceForm.components,
        properties: sourceForm.properties,
        introPage: sourceForm.introPage,
      };
      savedForm = await formsServiceTarget.post(createFormRequest, token);
    } else {
      const updateFormRequest = {
        title: sourceForm.title,
        components: sourceForm.components,
        properties: sourceForm.properties,
        introPage: sourceForm.introPage,
      };
      savedForm = await formsServiceTarget.put(formPath, updateFormRequest, targetForm.revision!, token);
    }
    logger.info(`Form ${formPath} copied to target`, logMeta);

    const targetTranslations = await formTranslationServiceTarget.get(formPath);
    const sourceTranslations = (await formTranslationServiceSource.get(formPath)).filter((t) => !t.globalTranslationId);
    logger.debug(`Found ${sourceTranslations.length} translation objects for form ${formPath} in source`, {
      ...logMeta,
      sourceTranslationIds: sourceTranslations.map((t) => t.id),
    });

    if (sourceTranslations.length > 0) {
      logger.info(`Will overwrite translations for form ${formPath} with data from source...`, logMeta);
      for (const sourceTranslation of sourceTranslations) {
        const target = targetTranslations.find((t) => t.key === sourceTranslation.key);
        if (target) {
          const body = {
            nb: sourceTranslation.nb,
            nn: sourceTranslation.nn,
            en: sourceTranslation.en,
            tag: sourceTranslation.tag,
            // TODO try to link to global if sourceTranslation.globalTranslationId exists?
          };
          await formTranslationServiceTarget.put(formPath, String(target.id), body, target.revision!, token);
        } else {
          const body = {
            key: sourceTranslation.key,
            nb: sourceTranslation.nb,
            nn: sourceTranslation.nn,
            en: sourceTranslation.en,
            tag: sourceTranslation.tag,
            // TODO try to link to global if sourceTranslation.globalTranslationId exists?
          };
          await formTranslationServiceTarget.post(formPath, body, token);
        }
      }
    } else {
      logger.info(`No translations for form ${formPath} found in source`, logMeta);
    }
    const obsoleteTargetTranslations = targetTranslations.filter(
      (t) => !sourceTranslations.some((st) => st.key === t.key),
    );
    for (const translation of obsoleteTargetTranslations) {
      await formTranslationServiceTarget.delete(formPath, translation.id!, token);
    }
    return savedForm;
  },
  globalTranslations: async (token: string) => {
    const sourceTranslations = await globalTranslationServiceSource.get();
    const targetTranslations = await globalTranslationServiceTarget.get();
    for (const sourceTranslation of sourceTranslations) {
      const targetTranslation = targetTranslations.find((t) => t.key === sourceTranslation.key);
      if (targetTranslation) {
        const body = {
          nb: sourceTranslation.nb,
          nn: sourceTranslation.nn,
          en: sourceTranslation.en,
          tag: sourceTranslation.tag,
        };
        await globalTranslationServiceTarget.put(
          String(targetTranslation.id!),
          body,
          targetTranslation.revision!,
          token,
        );
      } else {
        const body = {
          key: sourceTranslation.key,
          tag: sourceTranslation.tag,
          nb: sourceTranslation.nb,
          nn: sourceTranslation.nn,
          en: sourceTranslation.en,
        };
        await globalTranslationServiceTarget.post(body, token);
      }
    }
    // TODO Should we also delete global translations in target which does not exist in source?
  },
  getSourceForms: async () => {
    return await formsServiceSource.getAll('path,title,skjemanummer');
  },
});
