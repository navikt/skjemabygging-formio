import { Form, formioFormsApiUtils, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';
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
export const removeInnsendingTypeFromForm = <T extends Partial<Form>>(form: T): T => {
  if (!form.properties) {
    return form;
  }

  const formProperties: FormPropertiesType = (({ innsending, ettersending, ...rest }) => rest)(form.properties);
  return {
    ...form,
    properties: {
      ...formProperties,
      submissionTypes:
        form.properties.submissionTypes ??
        formioFormsApiUtils.mapInnsendingTypeToSubmissionTypes(form.properties.innsending),
      subsequentSubmissionTypes:
        form.properties.subsequentSubmissionTypes ??
        formioFormsApiUtils.mapEttersendingTypeToSubmissionTypes(form.properties.ettersending),
    },
  };
};

export { createHeaders };
