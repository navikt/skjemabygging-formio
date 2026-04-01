import { correlator, errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import cors from 'cors';
import express from 'express';
import apiRouter from './routers/api';
import internalRouter from './routers/internal';

const createApp = () => {
  const app = express();

  app.use(correlator());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', apiRouter);
  app.use('/internal', internalRouter);
  app.use(errorHandler);

  return app;
};

export { createApp };
