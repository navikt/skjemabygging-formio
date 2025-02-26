import { NavFormAPIType } from '../../form';
import { Form, FormStatus } from '../../forms-api-form';

const mapFormToNavForm = (form: Form): NavFormAPIType => {
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

const mapNavFormToForm = (form: NavFormAPIType): Form => {
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
