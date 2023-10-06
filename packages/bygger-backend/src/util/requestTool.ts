import { Request } from 'express';

const getFormioToken = (req: Request) => {
  return req.get('Bygger-Formio-Token') ?? req.body?.token;
};

export { getFormioToken };
