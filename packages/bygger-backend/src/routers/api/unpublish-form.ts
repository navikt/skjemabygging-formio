import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logging/logger';
import { publisherService } from '../../services';
import { BadRequest } from './helpers/errors';

const unpublishForm = async (req: Request, res: Response, next: NextFunction) => {
  const userName = req.getUser().name;
  const { formPath } = req.params;
  const { formsApiForm } = req.body;

  if (formPath !== formsApiForm.path) {
    next(new BadRequest('Path mismatch attempting to unpublish form'));
    return;
  }

  const logMeta = { formPath, userName };
  logger.info('Attempting to unpublish form (github)', logMeta);

  try {
    const result = await publisherService.unpublishForm(formPath);
    logger.info('Form is unpublished (github)', logMeta);
    res.json({ changed: result.changed, form: formsApiForm });
  } catch (error) {
    logger.error('Failed to unpublish form (github)', logMeta);
    next(error);
  }
};

export default unpublishForm;
