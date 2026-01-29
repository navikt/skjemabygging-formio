import { ErrorResponse } from '@navikt/skjemadigitalisering-shared-domain';
import { url } from '../index';

const isFormPathValid = (formPath: string): boolean => {
  if (!url.isValidPath(formPath)) {
    throw {
      message: 'Form path is not valid',
      status: 400,
      errorCode: 'BAD_REQUEST',
    } as ErrorResponse;
  }

  return true;
};

const service = {
  isFormPathValid,
};

export default service;
