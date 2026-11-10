import express, { Request, Response } from 'express';
import type { Registry } from 'prom-client';

interface CreateInternalRouterOptions {
  register: Pick<Registry, 'contentType' | 'metrics'>;
}

const createInternalRouter = ({ register }: CreateInternalRouterOptions) => {
  const internalRouter = express.Router();

  internalRouter.get(['/isAlive', '/isReady'], (_req: Request, res: Response) => {
    res.sendStatus(200);
  });

  // Express 5 passes a rejected promise to the error handler.
  internalRouter.get('/metrics', async (_req: Request, res: Response) => {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType).end(metrics);
  });

  return internalRouter;
};

export { createInternalRouter };
export type { CreateInternalRouterOptions };
