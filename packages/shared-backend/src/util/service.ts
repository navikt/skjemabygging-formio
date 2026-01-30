import { ErrorResponse } from '@navikt/skjemadigitalisering-shared-domain';
import { url } from '../index';

const validateParams = (params: (string | undefined)[]): boolean => {
  for (const param of params) {
    if (param && !url.isValidPath(param)) {
      throw {
        message: `${param} contain invalid characters.`,
        status: 400,
        errorCode: 'BAD_REQUEST',
      } as ErrorResponse;
    }
  }

  return true;
};

const service = {
  validateParams,
};

export default service;
