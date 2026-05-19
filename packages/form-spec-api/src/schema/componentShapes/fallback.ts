import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../logger';
import { JsonSchema, SchemaGenerationContext } from '../types';

const fallbackShape = (component: Component, context: SchemaGenerationContext): JsonSchema => {
  logger.warn('Unsupported component encountered during schema generation', {
    componentKey: component.key,
    componentType: component.type,
    formPath: context.formPath,
    revision: context.revision,
  });

  return {
    $comment: `Unsupported component type: ${component.type}`,
  };
};

export { fallbackShape };
