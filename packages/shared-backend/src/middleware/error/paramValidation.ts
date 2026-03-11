import { ResponseError, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { urlUtil } from '../../util';

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

const innsendingsId = (_req: Request, _res: Response, next: NextFunction, value: string) => {
  if (value && !validatorUtils.isValidUuid(value)) {
    return next(new ResponseError('BAD_REQUEST', 'Invalid innsendingsId.'));
  }

  next();
};

const attachmentId = (_req: Request, _res: Response, next: NextFunction, value: string) => {
  if (value && !validatorUtils.isValidAttachmentId(value)) {
    return next(new ResponseError('BAD_REQUEST', 'Invalid attachment id.'));
  }

  next();
};

const fileId = (_req: Request, _res: Response, next: NextFunction, value: string) => {
  if (value && !validatorUtils.isValidUuid(value)) {
    return next(new ResponseError('BAD_REQUEST', 'Invalid file id.'));
  }

  next();
};

const paramValidation = {
  attachmentId,
  fileId,
  formPath,
  languageCode,
  innsendingsId,
};

export default paramValidation;
