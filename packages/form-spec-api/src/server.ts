import { createApp } from './app';
import { config } from './config';
import { logger } from './logger';

const app = createApp();

logger.info(`serving on ${config.port}`);
if (import.meta.env.PROD) {
  app.listen(config.port);
}

export const viteNodeApp = app;
