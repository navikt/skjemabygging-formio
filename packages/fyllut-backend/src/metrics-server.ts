import express from 'express';
import { AggregatorRegistry } from 'prom-client';

const metricsServer = express();
const aggregatorRegistry = new AggregatorRegistry();

metricsServer.get('/node-cluster-metrics', async (req, res) => {
  try {
    const metrics = await aggregatorRegistry.clusterMetrics();
    res.set('Content-Type', aggregatorRegistry.contentType);
    res.send(metrics);
  } catch (ex: any) {
    res.statusCode = 500;
    res.send(ex.message);
  }
});

metricsServer.get('/isAlive', (req, res) => {
  res.status(200);
  res.send('Alive');
});

metricsServer.get('/isReady', (req, res) => {
  res.status(200);
  res.send('Ready');
});

export default metricsServer;
