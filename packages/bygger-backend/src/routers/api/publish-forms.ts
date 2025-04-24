import { formioFormsApiUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logging/logger';
import { formsService, publisherService } from '../../services';
import { BulkPublicationResult } from '../../services/formPublications/types';

const publishForms = async (req: Request, res: Response, _next: NextFunction) => {
  const { bulkPublicationResult } = req.body as { bulkPublicationResult: BulkPublicationResult };
  const successResult = bulkPublicationResult.filter((r) => r.status === 'ok');
  const failureResult = bulkPublicationResult.filter((r) => r.status !== 'ok');

  const publishedFormPaths = successResult.map((r) => r.form.path);
  const skippedFormPaths = failureResult.map((r) => r.form.path);
  const logMeta = { formPaths: publishedFormPaths, numberOfForms: publishedFormPaths.length, skippedFormPaths };
  logger.info(`Attempting to publish ${publishedFormPaths.length} forms (github)`, logMeta);
  try {
    const forms: NavFormType[] = [];
    for (const formPath of publishedFormPaths) {
      const form = await formsService.get(formPath);
      forms.push(formioFormsApiUtils.mapFormToNavForm(form));
    }
    const gitSha = await publisherService.publishForms(forms);
    logger.info(`Published ${publishedFormPaths.length} forms (github)`);
    res.json({ githubCommit: !!gitSha, bulkPublicationResult });
  } catch (error: any) {
    const { message, stack, ...errDetails } = error;
    logger.error('Failed to publish forms (github)', { ...errDetails, stack, errorMessage: message });
    res.json({ githubCommit: false, bulkPublicationResult });
  }
};

export default publishForms;
