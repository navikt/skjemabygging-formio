import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

const isConflictError = (error: unknown): error is ResponseError =>
  error instanceof ResponseError && error.errorCode === 'CONFLICT';

export { isConflictError };
