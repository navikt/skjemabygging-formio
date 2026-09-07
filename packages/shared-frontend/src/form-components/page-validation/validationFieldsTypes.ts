import { Component, Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { ComponentDefinition, ComponentDefinitionByType } from '../component-types';
import { InputComponentType } from '../inputComponentRegistryUtils';

/**
 * Everything a component needs to answer "which fields would I validate right now". It mirrors what
 * the input adapter has available when it renders: the component definition, its resolved
 * submission path, the value stored there, and the surrounding form/page context.
 */
interface ValidationFieldsContext<T extends Component = Component> {
  component: T;
  submissionPath: string;
  value: unknown;
  form: Form;
  submission?: Submission;
  submissionMethod?: SubmissionMethod;
  currentLanguage: string;
  /** The components of the page being rebuilt, for configuration that points at a sibling. */
  pageComponents: ComponentDefinition[];
  /** Collect the fields of nested components (containers, rows, data grid rows). */
  collectChildren: (components: ComponentDefinition[]) => ValidationField[];
}

/**
 * The headless counterpart of an input adapter: it maps a component definition to the generic
 * fields the rendered component would register, by calling the same component-owned builders.
 */
type ValidationFieldsBuilder<T extends Component = Component> = (
  context: ValidationFieldsContext<T>,
) => ValidationField[];

/**
 * Registry mapping each supported component `type` to its validation-fields builder. The mapped
 * type ties every key to the definition of that type and makes a missing key a compile error, the
 * same way `InputComponentRegistry` does for rendering.
 */
type ValidationFieldsRegistry = {
  [K in InputComponentType]: ValidationFieldsBuilder<ComponentDefinitionByType<K>>;
};

export type { ValidationFieldsBuilder, ValidationFieldsContext, ValidationFieldsRegistry };
