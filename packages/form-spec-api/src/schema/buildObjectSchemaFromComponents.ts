import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { inferValueSchema } from './inferValueSchema';
import {
  createsArrayScope,
  createsObjectScope,
  getNestedComponents,
  hasConditionalLogic,
  shouldFlattenComponent,
  shouldSkipComponent,
} from './structuralRules';
import { JsonSchemaObject, SchemaGenerationContext } from './types';

const buildObjectSchemaFromComponents = (
  components: Component[] = [],
  context: SchemaGenerationContext,
): JsonSchemaObject => {
  const properties: JsonSchemaObject['properties'] = {};
  const required: string[] = [];

  for (const component of components) {
    if (shouldFlattenComponent(component)) {
      const nestedSchema = buildObjectSchemaFromComponents(getNestedComponents(component), context);
      Object.assign(properties, nestedSchema.properties);
      required.push(...(nestedSchema.required || []));
      continue;
    }

    if (shouldSkipComponent(component) || !component.key) {
      continue;
    }

    if (createsObjectScope(component)) {
      properties[component.key] = {
        title: component.label,
        ...buildObjectSchemaFromComponents(getNestedComponents(component), context),
      };
    } else if (createsArrayScope(component)) {
      properties[component.key] = {
        type: 'array',
        title: component.label,
        items: buildObjectSchemaFromComponents(getNestedComponents(component), context),
      };
    } else {
      properties[component.key] = inferValueSchema(component, context);
    }

    if (component.validate?.required && !hasConditionalLogic(component)) {
      required.push(component.key);
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length ? { required } : {}),
    additionalProperties: false,
  };
};

export { buildObjectSchemaFromComponents };
