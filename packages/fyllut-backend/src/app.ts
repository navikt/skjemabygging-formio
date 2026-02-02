import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import mustacheExpress from 'mustache-express';
import { checkConfigConsistency, config } from './config/config';
import { NaisCluster } from './config/nais-cluster';
import { buildDirectory } from './context.js';
import { setupDeprecatedEndpoints } from './deprecatedEndpoints.js';
import expressJsonMetricHandler from './middleware/expressJsonMetricHandler';
import globalErrorHandler from './middleware/globalErrorHandler';
import httpRequestLogger from './middleware/httpRequestLogger.js';
import { stripTrailingSlash } from './middleware/stripTrailingSlash';
import renderIndex from './renderIndex';
import apiRouter from './routers/api/index';
import internalRouter from './routers/internal/index.js';
import loginRedirect from './security/loginRedirect';
import { setupDevServer } from './setup-dev-server';

export const createApp = (setupDev: boolean = false) => {
  checkConfigConsistency(config);

  // Match everything except internal, static and api
  const noApiStaticInternalRegex = /^(?!.*\/(internal|static|api)\/).*$/;

  const app = express();
  app.use(httpRequestLogger);

  app.use(expressJsonMetricHandler(express.json({ limit: '50mb' })));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(correlator() as any);
  app.use(cors());
  app.set('views', buildDirectory);
  app.set('view engine', 'mustache');
  app.engine('html', mustacheExpress());

  const fyllutRouter = express.Router();

  if (config.naisClusterName === NaisCluster.DEV || setupDev) {
    setupDevServer(app, fyllutRouter, config);
  }

  fyllutRouter.use('/', express.static(buildDirectory, { index: false }));

  setupDeprecatedEndpoints(fyllutRouter);
  fyllutRouter.use('/api', apiRouter);
  // path /internal is not publicly exposed, see https://doc.nais.io/clusters/gcp/#prod-gcp-ingresses
  fyllutRouter.use('/internal', internalRouter);

  stripTrailingSlash(fyllutRouter);

  // Get the form id
  fyllutRouter.use('/:formId', (req: Request, res: Response, next: NextFunction) => {
    res.locals.formId = req.params.formId;
    next();
  });

  fyllutRouter.use(noApiStaticInternalRegex, loginRedirect);
  fyllutRouter.use(noApiStaticInternalRegex, renderIndex);

  app.use(config.fyllutPath, fyllutRouter);

  app.use(globalErrorHandler);

  return app;
};
