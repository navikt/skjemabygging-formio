import { NextFunction, Request, Response } from 'express';
import { backendInstance } from '../../services';

const areaCodes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const areaCodesList = await backendInstance.fetchAreaCodes();
    res.send(areaCodesList);
  } catch (error) {
    next(error);
  }
};

export default areaCodes;
