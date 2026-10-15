import { errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import { FormClearOptions, FormClearStart, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import express, { ErrorRequestHandler } from 'express';
import config from '../../../config';
import { adHandlers } from '../../../middleware/azureAd';
import { formClearPublishService, formClearService } from '../../../services';
import authHandlers from '../helpers/authHandlers';
import { UnauthorizedError } from '../helpers/errors';

const router = express.Router();

router.use((_req, res, next) => {
  if (config.naisClusterName === 'prod-gcp') {
    return res.sendStatus(405);
  }
  next();
});
router.use(adHandlers.isAdmin, authHandlers.formsApiAuthHandler);

const validateOptions = (body: unknown): FormClearOptions => {
  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as FormClearOptions).keepTestForms !== 'boolean' ||
    typeof (body as FormClearOptions).keepLockedForms !== 'boolean' ||
    !Array.isArray((body as FormClearOptions).keepFormPaths) ||
    !(body as FormClearOptions).keepFormPaths.every(
      (path: unknown) => typeof path === 'string' && path.length > 0 && path.length <= 255 && !path.includes('..'),
    )
  ) {
    throw new ResponseError('BAD_REQUEST', 'Invalid form clear options');
  }
  return body as FormClearOptions;
};

const validateStart = (body: unknown): FormClearStart => {
  validateOptions(body);
  const request = body as FormClearStart;
  if (
    !Array.isArray(request.expectedToDelete) ||
    !Array.isArray(request.expectedKept) ||
    ![...request.expectedToDelete, ...request.expectedKept].every((path) => typeof path === 'string' && path.length > 0)
  ) {
    throw new ResponseError('BAD_REQUEST', 'Invalid expected form clear plan');
  }
  return request;
};

router.post('/preview', async (req, res, next) => {
  try {
    res.json(await formClearService.preview(validateOptions(req.body), req.headers.AzureAccessToken as string));
  } catch (error) {
    next(error);
  }
});

router.post('/jobs', async (req, res, next) => {
  try {
    res.status(201).json(await formClearService.start(validateStart(req.body), req.headers.AzureAccessToken as string));
  } catch (error) {
    next(error);
  }
});

router.get('/jobs/active', async (req, res, next) => {
  try {
    res.json(await formClearService.getActiveJob(req.headers.AzureAccessToken as string));
  } catch (error) {
    next(error);
  }
});

router.get('/jobs/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (typeof jobId !== 'string' || !/^[\w-]{1,100}$/.test(jobId)) {
      throw new ResponseError('BAD_REQUEST', 'Invalid job id');
    }
    res.json(await formClearService.getJob(jobId, req.headers.AzureAccessToken as string));
  } catch (error) {
    next(error);
  }
});

router.post('/publish-cleanup', async (req, res, next) => {
  try {
    const existing = await formClearService.getExistingPaths(req.headers.AzureAccessToken as string);
    const result = await formClearPublishService.cleanup(existing);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const mapAdminError: ErrorRequestHandler = (error, _req, _res, next) =>
  next(error instanceof UnauthorizedError ? new ResponseError('FORBIDDEN', 'Administrator access required') : error);
router.use(mapAdminError, errorHandler);

export default router;
