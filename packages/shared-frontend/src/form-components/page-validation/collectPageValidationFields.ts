import { Form, Submission, SubmissionMethod, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { getResolvedSubmissionPath } from '../../context/form-definition/formDefinitionUtils';
import { ValidationField } from '../../context/validation/validationTypes';
import { ComponentDefinition } from '../component-types';
import { InputComponentType } from '../inputComponentRegistryUtils';
import { validationFieldsRegistry } from './validationFieldsRegistry';
import { ValidationFieldsBuilder, ValidationFieldsRegistry } from './validationFieldsTypes';

interface CollectPageValidationFieldsArgs {
  /** The active components of the page, exactly as `RenderInputForm` receives them. */
  components: ComponentDefinition[];
  form: Form;
  submission?: Submission;
  submissionMethod?: SubmissionMethod;
  currentLanguage: string;
  validationRegistry?: ValidationFieldsRegistry;
}

/**
 * Rebuilds the fields a page would validate, without rendering it.
 *
 * This walks the same tree `RenderInputForm` walks - unsupported types fall through to their
 * children, hidden components and calculated values contribute nothing, data grids expand into
 * indexed rows - and asks each component type for the fields its rendered counterpart registers. It is what lets the
 * summary page validate a page the user never opened, and what keeps a page's errors current when
 * a later page changed a condition that shows or hides one of its fields.
 */
const collectPageValidationFields = ({
  components,
  form,
  submission,
  submissionMethod,
  currentLanguage,
  validationRegistry = validationFieldsRegistry,
}: CollectPageValidationFieldsArgs): ValidationField[] => {
  const collect = (currentComponents: ComponentDefinition[]): ValidationField[] =>
    currentComponents.flatMap((component) => {
      // Single boundary cast, the same one RenderInputComponent makes: indexing the mapped registry
      // by the runtime `type` yields a union of builders with incompatible context types.
      const builder = validationRegistry[component.type as InputComponentType] as ValidationFieldsBuilder | undefined;

      if (!builder) {
        return component.components?.length ? collect(component.components) : [];
      }

      if (component.hidden) {
        return [];
      }

      // Mirrors the render: a value the form calculates is not validated.
      if (component.calculateValue) {
        return component.components?.length ? collect(component.components) : [];
      }

      const submissionPath = getResolvedSubmissionPath(component);

      return builder({
        component,
        submissionPath,
        value: submissionUtils.getSubmissionValue(submissionPath, submission),
        form,
        submission,
        submissionMethod,
        currentLanguage,
        pageComponents: components,
        collectChildren: collect,
      });
    });

  return collect(components);
};

export { collectPageValidationFields };
export type { CollectPageValidationFieldsArgs };
