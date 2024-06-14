import { NextFunction, Request, Response } from 'express';
import { appMetrics } from '../services';

const expressJsonMetricHandler = (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'PUT' && req.url.includes('/send-inn/utfyltsoknad')) {
    const stopTimer = appMetrics.expressJsonBodyParserDuration.startTimer({ endpoint: 'put-utfyltsoknad' });
    let errorOccured = false;
    try {
      await fn(req, res, next);
    } catch (err) {
      errorOccured = true;
      throw err;
    } finally {
      stopTimer({ error: String(errorOccured) });
    }
  } else {
    await fn(req, res, next);
  }
};

export default expressJsonMetricHandler;
