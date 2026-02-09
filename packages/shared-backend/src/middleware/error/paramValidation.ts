import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { urlUtil } from '../../index';

const formPath = (_req: Request, _res: Response, next: NextFunction, value: string) => {
  if (value && !urlUtil.isValidPath(value)) {
    return next(new ResponseError('BAD_REQUEST', 'Form path contains invalid characters.'));
  }

  next();
};

const languageCode = (_req: Request, _res: Response, next: NextFunction, value: string) => {
  if (value && !/^[a-z]{2}$/.test(value)) {
    return next(new ResponseError('BAD_REQUEST', 'Language code contains invalid characters.'));
  }

  next();
};

const paramValidation = {
  formPath,
  languageCode,
};

export default paramValidation;
