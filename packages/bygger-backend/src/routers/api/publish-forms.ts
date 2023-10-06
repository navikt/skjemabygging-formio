import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logging/logger';
import { formioService, publisherService } from '../../services';
import { BadRequest } from './helpers/errors';

const publishForms = async (req: Request, res: Response, next: NextFunction) => {
  const formioToken = req.getFormioToken();
  const userName = req.getUser().name;
  const { formPaths } = req.body.payload;

  if (!Array.isArray(formPaths) || formPaths.length === 0) {
    next(new BadRequest('Request is missing formPaths'));
    return;
  }

  const logMeta = { formPaths, userName };
  logger.info('Attempting to publish forms', logMeta);
  try {
    const forms: any = await formioService.getForms(formPaths);
    const gitSha = await publisherService.publishForms(forms, { formioToken, userName });
    logger.info('Forms are published', logMeta);
    res.json({ changed: !!gitSha, gitSha });
  } catch (error) {
    logger.error('Failed to publish forms', logMeta);
    next(error);
  }
};

export default publishForms;
