import { Form, InnsendingType, SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
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

export const mapForm = (form: Form): Form => {
  const formProperties = (({ innsending, ...rest }) => rest)(form.properties);
  return {
    ...form,
    properties: {
      ...formProperties,
      submissionTypes: form.properties.submissionTypes ?? mapInnsendingToSubmissionTypes(form.properties.innsending),
    },
  };
};

export const mapInnsendingToSubmissionTypes = (innsending?: InnsendingType): SubmissionType[] => {
  if (!innsending) return [];

  switch (innsending) {
    case 'PAPIR_OG_DIGITAL':
      return ['PAPER', 'DIGITAL'];
    case 'KUN_PAPIR':
      return ['PAPER'];
    case 'KUN_DIGITAL':
      return ['DIGITAL'];
    default:
      return [];
  }
};

export { createHeaders };
