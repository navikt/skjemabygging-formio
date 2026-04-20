import { Form, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { buildObjectSchemaFromComponents } from './buildObjectSchemaFromComponents';
import { JsonSchemaObject } from './types';

const generateSchema = (form: Form): JsonSchemaObject => {
  const formDataSchema = buildObjectSchemaFromComponents(form.components, {
    formPath: form.path,
    revision: form.revision,
    supportsPersonalIdAttachment: submissionTypesUtils.isDigitalNoLoginSubmission(form.properties?.submissionTypes),
  });
  const { attachments, ...dataProperties } = formDataSchema.properties;

  const submissionPayloadSchema: JsonSchemaObject = {
    type: 'object',
    properties: {
      data: {
        ...formDataSchema,
        properties: dataProperties,
      },
      ...(attachments ? { attachments } : {}),
      ...(form.introPage?.enabled
        ? {
            selfDeclaration: {
              const: true,
              type: 'boolean',
            },
          }
        : {}),
    },
    required: [
      'data',
      ...(attachments ? ['attachments'] : []),
      ...(form.introPage?.enabled ? ['selfDeclaration'] : []),
    ],
    additionalProperties: false,
  };

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://skjemabygging.nav.no/forms/${form.path}/spec${form.revision ? `?revision=${form.revision}` : ''}`,
    title: form.title,
    type: 'object',
    properties: {
      language: {
        type: 'string',
      },
      data: submissionPayloadSchema,
    },
    required: ['language', 'data'],
    additionalProperties: false,
  };
};

export { generateSchema };
