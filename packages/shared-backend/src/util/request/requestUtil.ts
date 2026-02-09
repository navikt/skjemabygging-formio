import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Request } from 'express';

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
};

export default requestUtil;
