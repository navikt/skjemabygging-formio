import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

const { nologin } = config;

const verifyNologinToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('NologinToken');
    if (!token) {
      return res.sendStatus(403);
    }

    const payload = jwt.verify(token as string, nologin.jwtSecret) as jwt.JwtPayload | string;

    if (typeof payload !== 'object' || payload === null || (payload as jwt.JwtPayload).purpose !== 'nologin') {
      return res.sendStatus(401);
    }

    req.getNologinContext = () => ({
      innsendingsId: payload.innsendingsId,
    });
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.sendStatus(401);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new Error(`Nologin token verification failed: ${err.message}`));
    }
    return next(err);
  }
};

export default verifyNologinToken;
