import { NextFunction, Response } from 'express';
import { HttpError } from '../../../fetchUtils';
import { formioService } from '../../../services';
import { ByggerRequest } from '../../../types';
import { getFormioToken } from '../../../util/requestTool';
import { InternalServerError, UnauthorizedError } from './errors';

const authorizedPublisher = async (req: ByggerRequest, res: Response, next: NextFunction) => {
  const formioToken = getFormioToken(req);
  if (!formioToken) {
    next(new UnauthorizedError('Missing formio token'));
    return;
  }
  try {
    await formioService.getFormioUser(formioToken);
  } catch (e) {
    if ((e as HttpError).response?.status === 401) {
      next(new UnauthorizedError('Invalid formio token'));
    } else {
      next(new InternalServerError('Could not fetch user'));
    }
    return;
  }
  req.getFormioToken = () => formioToken;
  next();
};

export default authorizedPublisher;
