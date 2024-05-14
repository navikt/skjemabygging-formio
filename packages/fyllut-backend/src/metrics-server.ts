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

export default metricsServer;
