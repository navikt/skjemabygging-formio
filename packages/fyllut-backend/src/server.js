import nodeCluster from 'node:cluster';
import nodeOs from 'node:os';
import nodeProcess from 'node:process';
import { createApp } from './app';
import { logger } from './logger.js';
import metricsServer from './metrics-server';
import './utils/errorToJson.js';

const setupNodeCluster = !!process.env.NAIS_CLUSTER_NAME || process.env.ENABLE_CLUSTER === 'true';
const numCPUs = nodeOs.availableParallelism();
const port = parseInt(process.env.PORT || '8080');
const metricsPort = parseInt(process.env.METRICS_PORT || '4001');

let viteApp;

if (setupNodeCluster && nodeCluster.isPrimary) {
  logger.info(`Primary ${nodeProcess.pid} is running, will spawn ${numCPUs} workers`);

  // Start server for aggregated metrics
  metricsServer.listen(metricsPort);
  logger.info(`Metrics server for node cluster listening to ${metricsPort}`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    nodeCluster.fork();
  }

  nodeCluster.on('exit', (_worker, code, signal) => {
    logger.info(`Worker ${nodeProcess.pid} died`, { signal, code });
  });
} else {
  const app = createApp();
  if (import.meta.env.PROD) {
    app.listen(port);
    logger.info(`Worker ${process.pid} started, listening to ${port}`);
  } else {
    logger.info(`serving on ${port}`);
  }
  viteApp = app;
}

//Play nice with nais, force node to delay quiting to ensure no traffic is incoming
process.on('SIGTERM', () => setTimeout(() => logger.debug('Har sovet i 30 sekunder'), 30000));

export const viteNodeApp = viteApp;
