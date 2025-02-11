import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logging/logger';
import { publisherService } from '../../services';
import { BadRequest } from './helpers/errors';

const publishForm = async (req: Request, res: Response, next: NextFunction) => {
  const userName = req.getUser().name;
  const { formPath } = req.params;
  const { form, translations } = req.body;

  if (formPath !== form.path) {
    next(new BadRequest('Path mismatch attempting to publish form'));
    return;
  }

  const logMeta = { formPath, userName };
  logger.info('Attempting to publish form', logMeta);

  try {
    const result = await publisherService.publishForm(form, translations);
    const logMessage: string = result.changed ? 'Form is published' : 'Form has not been changed, publish aborted';
    logger.info(logMessage, logMeta);
    res.json(result);
  } catch (error) {
    logger.error('Failed to publish form', logMeta);
    next(error);
  }
};

export default publishForm;
