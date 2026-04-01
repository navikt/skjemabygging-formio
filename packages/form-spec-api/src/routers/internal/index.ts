import express from 'express';

const internalRouter = express.Router();

internalRouter.get(['/isAlive', '/isReady'], (_req, res) => {
  res.sendStatus(200);
});

export default internalRouter;
