import { NextFunction, Request, Response } from 'express';
import { appMetrics } from '../services';

const expressJsonMetricHandler = (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'PUT' && req.url.includes('/send-inn/utfyltsoknad')) {
    const stopTimer = appMetrics.expressJsonBodyParserDuration.startTimer({ endpoint: 'put-utfyltsoknad' });
    try {
      const nextWithTimer = (err?: Error) => {
        stopTimer({ error: err ? 'true' : 'false' });
        next(err);
      };
      fn(req, res, nextWithTimer);
    } catch (err) {
      stopTimer({ error: String('true') });
      throw err;
    }
  } else {
    fn(req, res, next);
  }
};

export default expressJsonMetricHandler;
