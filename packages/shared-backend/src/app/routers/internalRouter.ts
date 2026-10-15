import express, { NextFunction, Request, Response } from 'express';
import type { Registry } from 'prom-client';

interface CreateInternalRouterOptions {
  register: Pick<Registry, 'contentType' | 'metrics'>;
}

const createInternalRouter = ({ register }: CreateInternalRouterOptions) => {
  const internalRouter = express.Router();

  internalRouter.get(['/isAlive', '/isReady'], (_req: Request, res: Response) => {
    res.sendStatus(200);
  });

  internalRouter.get('/metrics', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err: any) {
      res.status(500).end(err.message);
      next(err);
    }
  });

  return internalRouter;
};

export { createInternalRouter };
export type { CreateInternalRouterOptions };
