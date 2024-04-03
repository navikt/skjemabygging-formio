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
    logger.info(`Will try to copy form ${formPath}...`, logMeta);

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
    return savedForm;
  },
});
