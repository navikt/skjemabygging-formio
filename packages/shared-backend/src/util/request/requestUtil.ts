import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Request } from 'express';

const getStringParam = (key: string, req: Request) => {
  const value = req.params[key];
  if (value === undefined) {
    throw new ResponseError('BAD_REQUEST', `${key} is required in path parameters`);
  }

  return String(value);
};

const getNumberParam = (key: string, req: Request) => {
  const value = req.params[key];
  if (value === undefined) {
    throw new ResponseError('BAD_REQUEST', `${key} is required in path parameters`);
  }

  return Number(value);
};

const getFile = (req: Request): Express.Multer.File => {
  const file = req.file;
  if (!file?.buffer) {
    throw new ResponseError('BAD_REQUEST', 'No file in request');
  }

  return file;
};

const getAccessToken = (req: Request) => {
  const accessToken = req.headers.AzureAccessToken as string;
  if (accessToken === undefined) {
    throw new ResponseError('BAD_REQUEST', 'Could not find AzureAccessToken in request headers');
  }

  return accessToken;
};

const requestUtil = {
  getStringParam,
  getNumberParam,
  getAccessToken,
  getFile,
};

export default requestUtil;
