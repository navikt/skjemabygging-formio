import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

class FormNotFoundError extends ResponseError {
  constructor(formPath: string) {
    super('NOT_FOUND', `Form with path "${formPath}" was not found`);
  }
}

class BadRequestError extends ResponseError {
  constructor(message: string) {
    super('BAD_REQUEST', message);
  }
}

export { BadRequestError, FormNotFoundError };
