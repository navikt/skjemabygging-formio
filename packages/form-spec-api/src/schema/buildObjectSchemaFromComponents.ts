import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../logger';
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

const warnIgnoredAttachmentPanelComponent = (
  component: Component,
  attachmentPanel: Component,
  context: SchemaGenerationContext,
) => {
  logger.warn('Ignoring non-attachment component inside attachment panel during schema generation', {
    attachmentPanelKey: attachmentPanel.key,
    componentKey: component.key,
    componentType: component.type,
    formPath: context.formPath,
    revision: context.revision,
  });
};

const collectAttachmentPanelItemSchemas = (
  components: Component[],
  attachmentPanel: Component,
  context: SchemaGenerationContext,
): JsonSchemaObject[] => {
  const attachmentItemSchemas: JsonSchemaObject[] = [];

  for (const component of components) {
    if (component.type === 'attachment') {
      attachmentItemSchemas.push(buildAttachmentItemSchema(component, context));
      continue;
    }

    warnIgnoredAttachmentPanelComponent(component, attachmentPanel, context);
    attachmentItemSchemas.push(
      ...collectAttachmentPanelItemSchemas(getNestedComponents(component), attachmentPanel, context),
    );
  }

  return attachmentItemSchemas;
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
): SchemaBuildResult => {
  const properties: JsonSchemaObject['properties'] = {};
  const required = new Set<string>();
  const attachmentItemSchemas: JsonSchemaObject[] = [];

  for (const component of components) {
    if (isAttachmentPanel(component)) {
      attachmentItemSchemas.push(
        ...collectAttachmentPanelItemSchemas(getNestedComponents(component), component, context),
      );
      continue;
    }

    if (shouldFlattenComponent(component)) {
      const nestedResult = buildObjectSchemaFromComponentsInternal(getNestedComponents(component), context);
      Object.assign(properties, nestedResult.schema.properties);
      nestedResult.schema.required?.forEach((key) => required.add(key));
      attachmentItemSchemas.push(...nestedResult.attachmentItemSchemas);
      continue;
    }

    if (shouldSkipComponent(component) || !component.key) {
      continue;
    }

    if (createsObjectScope(component)) {
      const nestedResult = buildObjectSchemaFromComponentsInternal(getNestedComponents(component), context);
      properties[component.key] = {
        title: component.label,
        ...nestedResult.schema,
      };
      attachmentItemSchemas.push(...nestedResult.attachmentItemSchemas);
    } else if (createsArrayScope(component)) {
      const nestedResult = buildObjectSchemaFromComponentsInternal(getNestedComponents(component), context);
      properties[component.key] = {
        type: 'array',
        title: component.label,
        items: nestedResult.schema,
      };
      attachmentItemSchemas.push(...nestedResult.attachmentItemSchemas);
    } else {
      properties[component.key] = inferValueSchema(component, context);
    }

    if (component.validate?.required && !hasConditionalLogic(component)) {
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
