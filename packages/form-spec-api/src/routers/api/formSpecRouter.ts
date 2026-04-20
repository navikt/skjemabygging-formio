import { formApiService, paramValidation } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import express from 'express';
import { config } from '../../config';
import { generateSchema } from '../../schema/generateSchema';
import { FormNotFoundError } from './helpers/errors';

const formSpecRouter = express.Router();

formSpecRouter.param('formPath', paramValidation.formPath);

formSpecRouter.get('/:formPath/spec', async (req, res, next) => {
  try {
    const form = await formApiService.getForm({
      baseUrl: config.formsApiUrl,
      formPath: req.params.formPath,
    });
    const schema = generateSchema(form);

    res.contentType('application/schema+json');
    res.status(200).send(schema);
  } catch (error) {
    if (error instanceof ResponseError && error.errorCode === 'NOT_FOUND') {
      next(new FormNotFoundError(req.params.formPath));
      return;
    }

    next(error);
  }
});

export default formSpecRouter;
