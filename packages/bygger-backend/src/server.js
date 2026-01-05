import express from 'express';
import correlator from 'express-correlation-id';
import config from './config';
import { buildDirectory, buildDirectoryIndexHtml } from './context.js';
import authHandler from './middleware/authHandler';
import { fsAccessRateLimiter } from './middleware/ratelimit';
import apiRouter from './routers/api';
import fyllutProxyRouter from './routers/fyllut-proxy';
import internalRouter from './routers/internal';
import notificationsRouter from './routers/notifications';
import './util/errorToJson';

const app = express();

app.use('/fyllut', fyllutProxyRouter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(correlator());
app.use('/internal', internalRouter);
app.use('/api', authHandler, apiRouter);
app.use('/notifications', notificationsRouter);

if (import.meta.env.PROD) {
  // serve built app in production (served by vite in development)
  app.use(express.static(buildDirectory));
  app.get('/*path', fsAccessRateLimiter, (req, res) => {
    res.sendFile(buildDirectoryIndexHtml);
  });
}

const { port, nodeEnv } = config;
console.log(`serving on ${port} (${nodeEnv})`);
if (import.meta.env.PROD) {
  app.listen(port);
}

export const viteNodeApp = app;
