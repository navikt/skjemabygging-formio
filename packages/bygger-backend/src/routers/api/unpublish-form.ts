import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logging/logger';
import { formioService, publisherService } from '../../services';
import { NotFoundError } from './helpers/errors';

const unpublishForm = async (req: Request, res: Response, next: NextFunction) => {
  const formioToken = req.getFormioToken();
  const userName = req.getUser().name;
  const { formPath } = req.params;

  const logMeta = { formPath, userName };
  logger.info('Attempting to unpublish form', logMeta);

  try {
    const form = await formioService.getForm(formPath);
    if (!form) {
      return next(new NotFoundError(`Did not find form with path ${formPath}`));
    }
    const result = await publisherService.unpublishForm(form, { formioToken, userName });
    logger.info('Form is unpublished', logMeta);
    res.json(result);
  } catch (error) {
    logger.error('Failed to unpublish form', logMeta);
    next(error);
  }
};

export default unpublishForm;
