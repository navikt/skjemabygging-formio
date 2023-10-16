import express from 'express';
import metrics from './metrics.js';
import status from './status.js';

const internalRouter = express.Router();

internalRouter.get('/isAlive|isReady', (req, res) => res.sendStatus(200));
internalRouter.get('/metrics', metrics.get);
internalRouter.get('/health/status', status.get);

export default internalRouter;
