import { createFormService } from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../config';

const formService = createFormService({
  baseUrl: config.formsApiUrl,
});

export { formService };
