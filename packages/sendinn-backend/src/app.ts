import { correlator, errorHandler, rateLimiter } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import mustacheExpress from 'mustache-express';
import { config } from './config/config';
import { buildDirectory } from './context';
import renderIndex from './renderIndex';
import apiRouter from './routers/api';
import internalRouter from './routers/internal';

const MS_ONE_MINUTE = 60 * 1000;

const createApp = () => {
  const app = express();
  // Keep the existing one-hop proxy trust setting until the proxy chain is verified in #2271.
  app.set('trust proxy', 1);
  app.use(correlator());
  app.use(express.json({ limit: '1mb' }));
  app.set('views', buildDirectory);
  app.set('view engine', 'mustache');
  app.engine('html', mustacheExpress());

  // Process-local limit shared by API and index requests; client IP resolution is tracked in #2271.
  const publicRateLimiter = rateLimiter(MS_ONE_MINUTE, 1000);

  const sendinnRouter = express.Router();
  sendinnRouter.use('/', express.static(buildDirectory, { index: false, redirect: false }));
  sendinnRouter.use('/api', publicRateLimiter, apiRouter);
  // path /internal is not publicly exposed, see https://doc.nais.io/clusters/gcp/#prod-gcp-ingresses
  sendinnRouter.use('/internal', internalRouter);
  // Index rendering calls Texas introspection and the decorator
  sendinnRouter.get('/{*path}', publicRateLimiter, renderIndex);

  app.use(config.basePath, sendinnRouter);
  app.use(errorHandler);

  return app;
};

export { createApp };
