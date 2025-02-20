import { InnsendingType, NavFormType, SubmissionType } from '../../form';
import { Form, FormStatus } from '../../forms-api-form';

const mapFormToNavForm = (form: Form): NavFormType => {
  const { title } = form;

  return {
    tags: [],
    display: 'wizard',
    name: title,
    type: 'form',
    ...form,
    properties: {
      ...form.properties,
      skjemanummer: form.skjemanummer,
      publishedLanguages: form.publishedLanguages,
    },
  };
};

const mapInnsendingToSubmissionTypes = (innsending?: InnsendingType): SubmissionType[] => {
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

const removeInnsendingFromForm = (form: NavFormType): NavFormType => {
  const formProperties = (({ innsending, ...rest }) => rest)(form.properties);
  return {
    ...form,
    properties: {
      ...formProperties,
      submissionTypes: form.properties.submissionTypes ?? mapInnsendingToSubmissionTypes(form.properties.innsending),
    },
  };
};

const mapNavFormToForm = (form: NavFormType): Form => {
  const {
    id,
    revision,
    path,
    title,
    components,
    properties,
    createdAt,
    createdBy,
    changedAt,
    changedBy,
    publishedAt,
    publishedBy,
    publishedLanguages,
    status,
  } = form;
  return {
    id,
    revision,
    skjemanummer: properties.skjemanummer,
    path,
    title,
    components,
    properties,
    createdAt,
    createdBy,
    changedAt,
    changedBy,
    publishedAt,
    publishedBy,
    publishedLanguages,
    status: status as FormStatus,
  };
};

export { mapFormToNavForm, mapNavFormToForm, removeInnsendingFromForm };
