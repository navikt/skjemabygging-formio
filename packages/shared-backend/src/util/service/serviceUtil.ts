import { ErrorResponse } from '@navikt/skjemadigitalisering-shared-domain';
import { urlUtil } from '../../index';

const validateFormPath = (formPath?: string): boolean => {
  if (formPath && !urlUtil.isValidPath(formPath)) {
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

const serviceUtil = {
  validateFormPath,
  validateLanguageCode,
};

export default serviceUtil;
