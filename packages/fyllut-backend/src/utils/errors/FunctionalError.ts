import { ErrorCode } from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';

export class FunctionalError extends Error {
  functional: boolean;
  correlation_id?: string;
  error_code?: ErrorCode;

  constructor(message: string, functional?: boolean) {
    super(message);

    this.functional = functional ?? false;
    this.correlation_id = correlator.getId();
  }
}
