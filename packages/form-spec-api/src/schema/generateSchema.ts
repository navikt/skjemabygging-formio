import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { buildObjectSchemaFromComponents } from './buildObjectSchemaFromComponents';
import { JsonSchemaObject } from './types';

const generateSchema = (form: Form): JsonSchemaObject => {
  const schema = buildObjectSchemaFromComponents(form.components, { formPath: form.path, revision: form.revision });

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://skjemabygging.nav.no/forms/${form.path}/spec${form.revision ? `?revision=${form.revision}` : ''}`,
    title: form.title,
    ...schema,
  };
};

export { generateSchema };
