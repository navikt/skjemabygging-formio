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

export const removeInnsendingFromForm = (form: Form): Form => {
  const formProperties = (({ innsending, ...rest }) => rest)(form.properties);
  return {
    ...form,
    properties: {
      ...formProperties,
      submissionTypes:
        form.properties.submissionTypes ??
        formioFormsApiUtils.mapInnsendingToSubmissionTypes(form.properties.innsending),
    },
  };
};

export { createHeaders };
