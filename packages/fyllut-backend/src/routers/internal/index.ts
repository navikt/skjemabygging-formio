import express from 'express';
import metrics from './metrics';

const internalRouter = express.Router();

internalRouter.get(['/isAlive', '/isReady'], (req, res) => {
  res.sendStatus(200);
});
internalRouter.get('/metrics', metrics.get);

export default internalRouter;
