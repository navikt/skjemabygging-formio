import { Request } from 'express';

const isValidPath = (path: string) => {
  return /^[a-z0-9]+$/.test(path);
};

const getCurrentUrl = (req: Request) => {
  return getBaseUrl(req) + req.originalUrl;
};

const getBaseUrl = (req: Request) => {
  return req.protocol + '://' + req.get('host');
};

const url = {
  getBaseUrl,
  getCurrentUrl,
  isValidPath,
};

export default url;
