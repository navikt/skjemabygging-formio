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

const getBodyValue = <T = unknown>(req: Request, name: string, optional?: boolean) => {
  const value = req.body?.[name] as T | null | undefined;
  if (value !== undefined && value !== null) {
    return value;
  }

  if (optional) {
    return undefined;
  }

  throw new ResponseError('BAD_REQUEST', `Missing body value "${name}"`);
};

const getFile = (req: Request): Express.Multer.File => {
  const file = req.file;
  if (!file?.buffer) {
    throw new ResponseError('BAD_REQUEST', 'No file in request');
  }

  return file;
};

const getHeader = (req: Request, headerName: keyof Request['headers']) => {
  const value = req.headers[headerName];
  if (typeof value === 'string') {
    return value;
  }

  throw new ResponseError('BAD_REQUEST', `Could not find ${headerName} in request headers`);
};

const getAzureAccessToken = (req: Request) => {
  return getHeader(req, 'AzureAccessToken');
};

const getPdfAccessToken = (req: Request) => {
  return getHeader(req, 'PdfAccessToken');
};

const getMergePdfToken = (req: Request) => {
  return getHeader(req, 'MergePdfToken');
};

const requestUtil = {
  getAzureAccessToken,
  getBodyValue,
  getMergePdfToken,
  getFile,
  getPdfAccessToken,
  getStringParam,
};

export default requestUtil;
