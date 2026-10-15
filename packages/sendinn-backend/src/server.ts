import { createApp } from './app';
import { config } from './config';
import { logger } from './logger';

const app = createApp();

logger.info(`serving on ${config.port}`);
if (import.meta.env.PROD) {
  app.listen(config.port);
}

// Delay shutdown so Nais can stop routing traffic to the pod first.
process.on('SIGTERM', () => setTimeout(() => logger.debug('Shutting down after SIGTERM delay'), 30000));

export const viteNodeApp = app;
