import { NavFormType } from '../../form';
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

// const mapEttersendingTypeToSubmissionTypes = (ettersending?: InnsendingType): SubmissionType[] => {
//   if (!ettersending) return ['PAPER', 'DIGITAL'];
//
//   switch (ettersending) {
//     case 'PAPIR_OG_DIGITAL':
//       return ['PAPER', 'DIGITAL'];
//     case 'KUN_PAPIR':
//       return ['PAPER'];
//     case 'KUN_DIGITAL':
//       return ['DIGITAL'];
//     default:
//       return [];
//   }
// };

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

export { mapFormToNavForm, mapNavFormToForm };
