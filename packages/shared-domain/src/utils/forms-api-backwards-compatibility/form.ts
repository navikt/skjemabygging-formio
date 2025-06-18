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
      skjemanummer: form.skjemanummer ?? form.properties.skjemanummer,
      publishedLanguages: form.publishedLanguages,
    },
    introPage: form?.introPage,
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
    introPage: form?.introPage,
  };
};

export { mapFormToNavForm, mapNavFormToForm };
