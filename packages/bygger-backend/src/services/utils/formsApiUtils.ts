import { Form, formioFormsApiUtils } from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';
import { v4 as uuid } from 'uuid';

const createHeaders = (accessToken?: string, revisionId?: number) => {
  return {
    'Content-Type': 'application/json',
    'x-correlation-id': correlator.getId() ?? uuid(),
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(revisionId && { 'Formsapi-Entity-Revision': `${revisionId}` }),
  };
};

/**
 *
 * Metoden er implementert kun for å støtte bakoverkompatibilitet og skal fjernes ved migrering
 */
export const removeInnsendingTypeFromForm = (form: Form): Form => {
  const formProperties = (({ innsending, ettersending, ...rest }) => rest)(form.properties);
  return {
    ...form,
    properties: {
      ...formProperties,
      submissionTypes:
        form.properties.submissionTypes ??
        formioFormsApiUtils.mapInnsendingTypeToSubmissionTypes(form.properties.innsending),
      subsequentSubmissionTypes:
        form.properties.subsequentSubmissionTypes ??
        formioFormsApiUtils.mapInnsendingTypeToSubmissionTypes(form.properties.ettersending),
    },
  };
};

export { createHeaders };
