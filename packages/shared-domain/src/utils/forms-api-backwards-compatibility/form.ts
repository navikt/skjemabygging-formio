import { NavFormType } from '../../form';
import { Form } from '../../forms-api-form';

const mapFormToNavForm = (form: Form): NavFormType => {
  const { title } = form;

  return {
    tags: [],
    display: 'wizard',
    name: title,
    type: 'form',
    ...form,
    properties: { ...form.properties, skjemanummer: form.skjemanummer },
  };
};

const mapNavFormToForm = (form: NavFormType): Form => {
  const { id, revision, path, title, components, properties, createdAt, createdBy, changedAt, changedBy } = form;
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
  };
};

export { mapFormToNavForm, mapNavFormToForm };
