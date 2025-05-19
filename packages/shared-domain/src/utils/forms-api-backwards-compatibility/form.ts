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
      skjemanummer: form.skjemanummer ?? form.properties.skjemanummer,
      publishedLanguages: form.publishedLanguages,
    },
  };
};

/**
 *
 * Metoden er implementert kun for å støtte bakoverkompatibilitet og skal fjernes ved migrering
 */
const mapInnsendingTypeToSubmissionTypes = (innsendingType?: InnsendingType): SubmissionType[] => {
  if (!innsendingType) return [];

  switch (innsendingType) {
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

const mapEttersendingTypeToSubmissionTypes = (ettersending?: InnsendingType): SubmissionType[] => {
  if (!ettersending) return ['PAPER', 'DIGITAL'];

  switch (ettersending) {
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

/**
 *
 * Metoden er implementert kun for å støtte bakoverkompatibilitet og skal fjernes ved migrering
 */
const removeInnsendingFromForm = (form: NavFormType): NavFormType => {
  const formProperties = (({ innsending, ...rest }) => rest)(form.properties);
  return {
    ...form,
    properties: {
      ...formProperties,
      submissionTypes:
        form.properties.submissionTypes ?? mapInnsendingTypeToSubmissionTypes(form.properties.innsending),
      subsequentSubmissionTypes:
        form.properties.subsequentSubmissionTypes ?? mapEttersendingTypeToSubmissionTypes(form.properties.ettersending),
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

export {
  mapEttersendingTypeToSubmissionTypes,
  mapFormToNavForm,
  mapInnsendingTypeToSubmissionTypes,
  mapNavFormToForm,
  removeInnsendingFromForm,
};
