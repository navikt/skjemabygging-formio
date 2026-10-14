import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Request } from 'express';

const isValidPath = (path: string, strict: boolean = true) => {
  if (strict) {
    return validatorUtils.isValidFormPath(path);
  }

  return /^[A-Za-z0-9_-]+$/.test(path);
};

const getCurrentUrl = (req: Request) => {
  return getBaseUrl(req) + req.originalUrl;
};

const getBaseUrl = (req: Request) => {
  return req.protocol + '://' + req.get('host');
};

const urlUtil = {
  getBaseUrl,
  getCurrentUrl,
  isValidPath,
};

export default urlUtil;
