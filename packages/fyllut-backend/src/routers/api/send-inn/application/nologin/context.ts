import { validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NologinContext } from '../../../../../types/nologin';

const validateNologinContext = (context: NologinContext | undefined): NologinContext => {
  if (!context) {
    throw Error('Nologin context is missing');
  }
  if (!validatorUtils.isValidUuid(context.innsendingsId)) {
    throw Error('Invalid innsendingsId in nologin context');
  }
  return context;
};

export { validateNologinContext };
