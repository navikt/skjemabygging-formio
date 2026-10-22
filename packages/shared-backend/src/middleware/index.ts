import correlator from 'express-correlation-id';
import { createEntraIdM2mHandler, createEntraIdOboHandler } from './entraIdHandler';
import errorHandler from './error/errorHandler';
import paramValidation from './error/paramValidation';
import { requestAbortHandler } from './error/requestAbortHandler';

export type { CreateEntraIdHandlerOptions, EntraIdHandlerLogger } from './entraIdHandler';
export {
  correlator,
  createEntraIdM2mHandler,
  createEntraIdOboHandler,
  errorHandler,
  paramValidation,
  requestAbortHandler,
};
