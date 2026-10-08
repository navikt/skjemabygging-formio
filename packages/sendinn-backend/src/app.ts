import { correlator, errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import mustacheExpress from 'mustache-express';
import { config } from './config';
import { buildDirectory } from './context';
import renderIndex from './renderIndex';
import apiRouter from './routers/api';
import internalRouter from './routers/internal';

const createApp = () => {
  const app = express();
  // The NAIS ingress sets a single X-Forwarded-For value, so trusting one hop gives the real client address.
  app.set('trust proxy', 1);
  app.use(correlator());
  app.use(express.json({ limit: '1mb' }));
  app.set('views', buildDirectory);
  app.set('view engine', 'mustache');
  app.engine('html', mustacheExpress());

  const sendinnRouter = express.Router();
  sendinnRouter.use('/', express.static(buildDirectory, { index: false, redirect: false }));
  sendinnRouter.use('/api', apiRouter);
  // path /internal is not publicly exposed, see https://doc.nais.io/clusters/gcp/#prod-gcp-ingresses
  sendinnRouter.use('/internal', internalRouter);
  sendinnRouter.get('/{*path}', renderIndex);

  app.use(config.basePath, sendinnRouter);
  app.use(errorHandler);

  return app;
};

export { createApp };
