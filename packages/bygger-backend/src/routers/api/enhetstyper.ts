import { NextFunction, Request, Response } from 'express';
import { backendInstance } from '../../services';

const enhetstyper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enhetstyper = await backendInstance.fetchEnhetstyper();
    res.send(enhetstyper);
  } catch (error) {
    next(error);
  }
};

export default enhetstyper;
