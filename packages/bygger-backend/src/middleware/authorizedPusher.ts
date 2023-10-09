import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { UnauthorizedError } from '../routers/api/helpers/errors';

const authorizedPusher = async (req: Request, res: Response, next: NextFunction) => {
  const pusherSecretHash = req.get('Bygger-Pusher-Secret-Hash');
  if (!pusherSecretHash) {
    next(new UnauthorizedError('Missing pusher secret hash'));
    return;
  }
  if (!bcrypt.compareSync(config.pusher.secret, pusherSecretHash)) {
    next(new UnauthorizedError('Invalid pusher secret'));
    return;
  }
  next();
};

export default authorizedPusher;
