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

type GetBodyValue = {
  <T = unknown>(req: Request, name: string): T;
  <T = unknown>(req: Request, name: string, optional: false): T;
  <T = unknown>(req: Request, name: string, optional: true): T | undefined;
};

const getBodyValue: GetBodyValue = <T = unknown>(req: Request, name: string, optional?: boolean) => {
  const value = req.body?.[name] as T | null | undefined;
  if (value !== undefined && value !== null) {
    return value;
  }

  if (optional) {
    return undefined;
  }

  throw new ResponseError('BAD_REQUEST', `Missing body value "${name}"`);
};

const getStringQuery = (req: Request, name: string, optional?: boolean) => {
  const value = req.query?.[name];
  if (typeof value === 'string') {
    return value;
  }

  if (optional) {
    return undefined;
  }

  throw new ResponseError('BAD_REQUEST', `Missing query param "${name}"`);
};

const getQueryObject = <T extends Request['query'] = Request['query']>(req: Request): T => {
  return req.query as T;
};

const getFile = (req: Request): Express.Multer.File => {
  const file = req.file;
  if (!file || (!file.buffer && !file.path)) {
    throw new ResponseError('BAD_REQUEST', 'No file in request');
  }

  return file;
};

type GetHeader = {
  (req: Request, headerName: keyof Request['headers'], optional?: false): string;
  (req: Request, headerName: keyof Request['headers'], optional: true): string | undefined;
};

const getHeader: GetHeader = ((req: Request, headerName: keyof Request['headers'], optional?: boolean) => {
  const value = req.headers[headerName];
  if (typeof value === 'string') {
    return value;
  }

  if (optional && value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    throw new ResponseError('BAD_REQUEST', `Request header "${headerName}" must be a single string value`);
  }

  throw new ResponseError('BAD_REQUEST', `Could not find ${headerName} in request headers`);
}) as GetHeader;

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
  getHeader,
  getMergePdfToken,
  getFile,
  getPdfAccessToken,
  getQueryObject,
  getStringParam,
  getStringQuery,
};

export default requestUtil;
