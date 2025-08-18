import { NextFunction, Request, Response } from 'express';
import { nologinService } from '../services';

const nologinTokenHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('NologinToken');
    if (!token) {
      return res.sendStatus(403);
    }

    const payload = nologinService.verifyToken(token);
    if (!payload) {
      return res.sendStatus(401);
    }

    req.getNologinContext = () => ({
      innsendingsId: payload.innsendingsId,
    });
    return next();
  } catch (err) {
    return next(err);
  }
};

export default nologinTokenHandler;
