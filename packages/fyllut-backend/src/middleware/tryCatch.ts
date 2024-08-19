import { NextFunction, Request, Response } from 'express';

const tryCatch =
  (fn: (req: Request, res: Response, next: NextFunction) => void) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      next(e);
    }
  };

export default tryCatch;
