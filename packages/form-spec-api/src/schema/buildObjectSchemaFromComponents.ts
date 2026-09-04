import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { inferValueSchema } from './inferValueSchema';
import {
  createsArrayScope,
  createsObjectScope,
  getNestedComponents,
  hasConditionalLogic,
  isAttachmentPanel,
  shouldFlattenComponent,
  shouldSkipComponent,
} from './structuralRules';
import { JsonSchema, JsonSchemaObject, SchemaGenerationContext } from './types';

type SchemaBuildResult = {
  schema: JsonSchemaObject;
  attachmentItemSchemas: JsonSchemaObject[];
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

const buildAttachmentItemSchema = (component: Component, context: SchemaGenerationContext): JsonSchemaObject => ({
  type: 'object',
  title: component.label,
  properties: {
    attachmentId: { type: 'string' },
    navId: {
      type: 'string',
      ...(component.navId ? { enum: [component.navId] } : {}),
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
});

const buildLegacyAttachmentValueSchema = (
  component: Component,
  context: SchemaGenerationContext,
): JsonSchemaObject => ({
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
  const legacyValueSchema = buildLegacyAttachmentValueSchema(component, context);

  return component.attachmentType === 'other' || component.otherDocumentation
    ? {
        title: component.label,
        anyOf: [{ type: 'array', items: attachmentItemSchema }, legacyValueSchema],
      }
    : {
        title: component.label,
        anyOf: [attachmentItemSchema, legacyValueSchema],
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
            oneOf: attachmentItemSchemas,
          },
  };
};

const buildObjectSchemaFromComponentsInternal = (
  components: Component[] = [],
  context: SchemaGenerationContext,
  ancestorHasConditionalLogic = false,
  insideAttachmentPanel = false,
): SchemaBuildResult => {
  const properties: JsonSchemaObject['properties'] = {};
  const required = new Set<string>();
  const attachmentItemSchemas: JsonSchemaObject[] = [];

  for (const component of components) {
    const descendantHasConditionalLogic = ancestorHasConditionalLogic || hasConditionalLogic(component);
    const descendantIsInsideAttachmentPanel = insideAttachmentPanel || isAttachmentPanel(component);

    if (component.type === 'attachment' && insideAttachmentPanel) {
      attachmentItemSchemas.push(buildAttachmentItemSchema(component, context));
      if (component.key) {
        properties[component.key] = buildAttachmentDataSchema(component, context);
      }
      continue;
    }

    if (shouldFlattenComponent(component)) {
      const nestedResult = buildObjectSchemaFromComponentsInternal(
        getNestedComponents(component),
        context,
        descendantHasConditionalLogic,
        descendantIsInsideAttachmentPanel,
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
        descendantIsInsideAttachmentPanel,
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
        descendantIsInsideAttachmentPanel,
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
): JsonSchemaObject => {
  const result = buildObjectSchemaFromComponentsInternal(components, context);
  if (context.supportsPersonalIdAttachment) {
    result.attachmentItemSchemas.unshift(personalIdAttachmentItemSchema);
  }
  const attachmentsSchema = buildAttachmentsSchema(result.attachmentItemSchemas);

  if (attachmentsSchema) {
    result.schema.properties.attachments = attachmentsSchema;
  }

  return result.schema;
};

export { buildObjectSchemaFromComponents };
