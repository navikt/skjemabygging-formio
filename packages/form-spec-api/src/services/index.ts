import { createFormService } from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../config';

const formService = createFormService({
  baseUrl: config.formsApiUrl,
  formsApiStaging: true, // Always get from database, never published form.
});

export { formService };
