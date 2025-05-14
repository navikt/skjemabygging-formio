import { NextFunction, Request, Response } from 'express';
import { htmlResponseError } from '../utils/errorHandling';
import { isValidPath } from '../utils/url';

const tryCatch =
  (fn: (req: Request, res: Response, next: NextFunction) => void) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const formPath = req.params?.form;
    if (formPath && !isValidPath(formPath)) {
      throw new Error(`Invalid formPath: ${formPath}`);
    }
    try {
      await fn(req, res, next);
    } catch (e: any) {
      const message = htmlResponseError(e.message);
      next(message);
    }
  };

export default tryCatch;
