import { RequestHandler } from 'express';
import { UnauthorizedError } from '../routers/api/helpers/errors';

const adHandlers: RequestHandlers = {
  isAdmin: (req, res, next) => {
    if (req.getUser().isAdmin) {
      next();
    } else {
      next(new UnauthorizedError('User is not administrator'));
    }
  },
};

type RequestHandlers = {
  [key: string]: RequestHandler;
};

export { adHandlers };
