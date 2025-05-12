import { NextFunction, Request, Response } from 'express';
import { htmlResponseError } from '../utils/errorHandling';

const tryCatch =
  (fn: (req: Request, res: Response, next: NextFunction) => void) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (e: any) {
      const message = htmlResponseError(e.message);
      next(message);
    }
  };

export default tryCatch;
