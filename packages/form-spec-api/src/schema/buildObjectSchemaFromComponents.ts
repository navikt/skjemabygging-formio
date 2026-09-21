import { Component, getNavId } from '@navikt/skjemadigitalisering-shared-domain';
import { inferValueSchema } from './inferValueSchema';
import {
  createsArrayScope,
  createsObjectScope,
  getNestedComponents,
  hasConditionalLogic,
  shouldFlattenComponent,
  shouldSkipComponent,
} from './structuralRules';
import { JsonSchema, JsonSchemaObject, SchemaGenerationContext } from './types';

type SchemaBuildResult = {
  schema: JsonSchemaObject;
  attachmentItemSchemas: JsonSchemaObject[];
};

type FormSchemaBuildResult = {
  dataSchema: JsonSchemaObject;
  submissionAttachmentsSchema?: JsonSchema;
};

const uploadedFileSchema: JsonSchemaObject = {
  type: 'object',
  properties: {
    fileId: { type: 'string' },
    attachmentId: { type: 'string' },
    innsendingId: { type: 'string' },
    fileName: { type: 'string' },
    size: { type: 'number' },
  },
  required: ['fileId', 'attachmentId', 'innsendingId', 'fileName', 'size'],
  additionalProperties: false,
};

const resolveAttachmentType = (component: Component) =>
  component.attachmentType || (component.otherDocumentation ? 'other' : 'default');

const buildAttachmentItemSchema = (component: Component, context: SchemaGenerationContext): JsonSchemaObject => {
  const navId = getNavId(component) ?? component.key;

  return {
    type: 'object',
    title: component.label,
    properties: {
      attachmentId: { type: 'string' },
      navId: {
        type: 'string',
        ...(navId ? { enum: [navId] } : {}),
      },
      type: {
        type: 'string',
        enum: [resolveAttachmentType(component)],
      },
      value: inferValueSchema(component, context),
      title: { type: 'string' },
      additionalDocumentation: { type: 'string' },
      files: {
        type: 'array',
        items: uploadedFileSchema,
      },
    },
    required: ['attachmentId', 'navId', 'type'],
    additionalProperties: false,
  };
};

const buildAttachmentChoiceSchema = (component: Component, context: SchemaGenerationContext): JsonSchemaObject => ({
  type: 'object',
  title: component.label,
  properties: {
    key: inferValueSchema(component, context),
    additionalDocumentation: { type: 'string' },
  },
  required: ['key'],
  additionalProperties: false,
});

const buildAttachmentDataSchema = (component: Component, context: SchemaGenerationContext): JsonSchema => {
  const attachmentItemSchema = buildAttachmentItemSchema(component, context);
  const choiceSchema = buildAttachmentChoiceSchema(component, context);
  const primitiveSchema = inferValueSchema(component, context);

  return component.attachmentType === 'other' || component.otherDocumentation
    ? {
        title: component.label,
        anyOf: [{ type: 'array', items: attachmentItemSchema }, attachmentItemSchema, choiceSchema, primitiveSchema],
      }
    : {
        title: component.label,
        anyOf: [attachmentItemSchema, choiceSchema, primitiveSchema],
      };
};

const personalIdAttachmentValues = [
  'norwegianPassport',
  'foreignPassport',
  'nationalIdEU',
  'driversLicense',
  'driversLicenseEU',
] as const;

const personalIdAttachmentItemSchema: JsonSchemaObject = {
  type: 'object',
  title: 'Personal ID',
  properties: {
    attachmentId: {
      type: 'string',
      enum: ['personal-id'],
    },
    navId: {
      type: 'string',
      enum: ['personal-id'],
    },
    type: {
      type: 'string',
      enum: ['personal-id'],
    },
    value: {
      type: 'string',
      enum: [...personalIdAttachmentValues],
    },
    title: { type: 'string' },
    additionalDocumentation: { type: 'string' },
    files: {
      type: 'array',
      items: uploadedFileSchema,
    },
  },
  required: ['attachmentId', 'navId', 'type'],
  additionalProperties: false,
};

const buildAttachmentsSchema = (attachmentItemSchemas: JsonSchemaObject[]): JsonSchema | undefined => {
  if (!attachmentItemSchemas.length) {
    return undefined;
  }

  return {
    type: 'array',
    title: 'Attachments',
    items:
      attachmentItemSchemas.length === 1
        ? attachmentItemSchemas[0]
        : {
            anyOf: attachmentItemSchemas,
          },
  };
};

const buildObjectSchemaFromComponentsInternal = (
  components: Component[] = [],
  context: SchemaGenerationContext,
  ancestorHasConditionalLogic = false,
): SchemaBuildResult => {
  const properties: JsonSchemaObject['properties'] = {};
  const required = new Set<string>();
  const attachmentItemSchemas: JsonSchemaObject[] = [];

  for (const component of components) {
    const descendantHasConditionalLogic = ancestorHasConditionalLogic || hasConditionalLogic(component);

    if (component.type === 'attachment') {
      attachmentItemSchemas.push(buildAttachmentItemSchema(component, context));
      if (component.key) {
        properties[component.key] = buildAttachmentDataSchema(component, context);
        if (component.validate?.required && !descendantHasConditionalLogic) {
          required.add(component.key);
        }
      }
      continue;
    }

    if (shouldFlattenComponent(component)) {
      const nestedResult = buildObjectSchemaFromComponentsInternal(
        getNestedComponents(component),
        context,
        descendantHasConditionalLogic,
      );
      Object.assign(properties, nestedResult.schema.properties);
      nestedResult.schema.required?.forEach((key) => required.add(key));
      attachmentItemSchemas.push(...nestedResult.attachmentItemSchemas);
      continue;
    }

    if (shouldSkipComponent(component) || !component.key) {
      continue;
    }

    if (createsObjectScope(component)) {
      const nestedResult = buildObjectSchemaFromComponentsInternal(
        getNestedComponents(component),
        context,
        descendantHasConditionalLogic,
      );
      properties[component.key] = {
        title: component.label,
        ...nestedResult.schema,
      };
      attachmentItemSchemas.push(...nestedResult.attachmentItemSchemas);
    } else if (createsArrayScope(component)) {
      const nestedResult = buildObjectSchemaFromComponentsInternal(
        getNestedComponents(component),
        context,
        descendantHasConditionalLogic,
      );
      properties[component.key] = {
        type: 'array',
        title: component.label,
        items: nestedResult.schema,
      };
      attachmentItemSchemas.push(...nestedResult.attachmentItemSchemas);
    } else {
      properties[component.key] = inferValueSchema(component, context);
    }

    if (component.validate?.required && !descendantHasConditionalLogic) {
      required.add(component.key);
    }
  }

  return {
    schema: {
      type: 'object',
      properties,
      ...(required.size ? { required: [...required] } : {}),
      additionalProperties: false,
    },
    attachmentItemSchemas,
  };
};

const buildObjectSchemaFromComponents = (
  components: Component[] = [],
  context: SchemaGenerationContext,
): FormSchemaBuildResult => {
  const result = buildObjectSchemaFromComponentsInternal(components, context);
  const submissionAttachmentItemSchemas = [...result.attachmentItemSchemas];
  if (context.supportsPersonalIdAttachment) {
    submissionAttachmentItemSchemas.unshift(personalIdAttachmentItemSchema);
  }

  return {
    dataSchema: result.schema,
    submissionAttachmentsSchema: buildAttachmentsSchema(submissionAttachmentItemSchemas),
  };
};

export { buildObjectSchemaFromComponents };
