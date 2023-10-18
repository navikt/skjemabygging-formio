import { NextFunction, Request, Response } from 'express';
import { appMetrics } from '../../services';

const metrics = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { register } = appMetrics;
      res.set('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.end(metrics);
    } catch (err: any) {
      res.status(500).end(err.message);
      next(err);
    }
  },
};

export default metrics;
