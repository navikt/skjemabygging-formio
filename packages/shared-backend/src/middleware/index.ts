import correlator from 'express-correlation-id';
import { createEntraIdM2mHandler, createEntraIdOboHandler } from './entraIdHandler';
import errorHandler from './error/errorHandler';
import paramValidation from './error/paramValidation';
import { rateLimiter } from './rateLimiter';
import { createIdportenAuth, createTokenxHandler, getIdportenUser, getTokenxToken } from './texas';

export type { CreateEntraIdHandlerOptions, EntraIdHandlerLogger } from './entraIdHandler';
export type { CreateIdportenAuthOptions, CreateTokenxHandlerOptions, IdportenAuth, IdportenUser } from './texas';
export {
  correlator,
  createEntraIdM2mHandler,
  createEntraIdOboHandler,
  createIdportenAuth,
  createTokenxHandler,
  errorHandler,
  getIdportenUser,
  getTokenxToken,
  paramValidation,
  rateLimiter,
};
