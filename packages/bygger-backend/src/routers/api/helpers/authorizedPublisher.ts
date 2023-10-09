import { NextFunction, Response } from 'express';
import { formioService } from '../../../services';
import { ByggerRequest } from '../../../types';
import { getFormioToken } from '../../../util/requestTool';
import { UnauthorizedError } from './errors';

const authorizedPublisher = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  const formioToken = getFormioToken(req);
  if (!formioToken) {
    next(new UnauthorizedError('Missing formio token'));
    return;
  }
  try {
    await formioService.getFormioUser(formioToken);
  } catch (e) {
    next(new UnauthorizedError('Invalid formio token'));
    return;
  }
  req.getFormioToken = () => formioToken;
  next();
};

export default authorizedPublisher;
