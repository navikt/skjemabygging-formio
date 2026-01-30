import { ErrorResponse } from '@navikt/skjemadigitalisering-shared-domain';
import { url } from '../index';

const validateFormPath = (formPath?: string): boolean => {
  if (formPath && !url.isValidPath(formPath)) {
    throw {
      message: 'Form path contain invalid characters.',
      status: 400,
      errorCode: 'BAD_REQUEST',
    } as ErrorResponse;
  }

  return true;
};

const validateLanguageCode = (languageCode?: string): boolean => {
  if (languageCode && /^[a-z]{2}$/.test(languageCode)) {
    throw {
      message: 'Language code contain invalid characters.',
      status: 400,
      errorCode: 'BAD_REQUEST',
    } as ErrorResponse;
  }

  return true;
};

const service = {
  validateFormPath,
  validateLanguageCode,
};

export default service;
