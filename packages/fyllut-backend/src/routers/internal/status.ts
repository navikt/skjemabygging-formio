import { NextFunction, Request, Response } from 'express';

interface ApplicationStatus {
  status: 'OK' | 'ISSUE' | 'DOWN';
  description?: string;
  logLink?: string;
}

const status = {
  get: async (req: Request, res: Response, _next: NextFunction) => {
    const response: ApplicationStatus = { status: 'OK', description: 'OK' };
    res.json(response);
  },
};

export default status;
