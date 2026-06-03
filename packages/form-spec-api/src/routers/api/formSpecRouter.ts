import { paramValidation } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import express from 'express';
import { generateSchema } from '../../schema/generateSchema';
import { formService } from '../../services';
import { FormNotFoundError } from './helpers/errors';

const formSpecRouter = express.Router();

formSpecRouter.param('formPath', paramValidation.formPath);

formSpecRouter.get('/:formPath/spec', async (req, res, next) => {
  try {
    const form = await formService.getForm({
      formPath: req.params.formPath,
      select: ['components', 'introPage', 'path', 'properties', 'revision', 'skjemanummer', 'title'],
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
