import { createApp } from './app';
import { logger } from './logger';
import './utils/errorToJson.js';

const port = parseInt(process.env.PORT || '8080');

const app = createApp();

logger.info(`serving on ${port}`);
if (import.meta.env.PROD) {
  app.listen(port);
}

//Play nice with nais, force node to delay quiting to ensure no traffic is incoming
process.on('SIGTERM', () => setTimeout(() => logger.debug('Har sovet i 30 sekunder'), 30000));

export const viteNodeApp = app;
