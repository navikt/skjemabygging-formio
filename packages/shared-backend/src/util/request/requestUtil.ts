import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Request } from 'express';

const getStringParam = (req: Request, name: string, optional?: boolean) => {
  const value = req.params[name] as string | string[] | undefined;
  if (value === undefined) {
    if (optional) {
      return undefined;
    }

    throw new ResponseError('BAD_REQUEST', `Missing route param "${name}"`);
  }

  if (Array.isArray(value)) {
    throw new ResponseError('BAD_REQUEST', `Route param "${name}" must be a single string value`);
  }

  return value;
};

const getFile = (req: Request): Express.Multer.File => {
  const file = req.file;
  if (!file?.buffer) {
    throw new ResponseError('BAD_REQUEST', 'No file in request');
  }

  return file;
};

const getAzureAccessToken = (req: Request) => {
  const accessToken = req.headers.AzureAccessToken as string;
  if (accessToken === undefined) {
    throw new ResponseError('BAD_REQUEST', 'Could not find AzureAccessToken in request headers');
  }

  return accessToken;
};

const requestUtil = {
  getAzureAccessToken,
  getFile,
  getStringParam,
};

export default requestUtil;
