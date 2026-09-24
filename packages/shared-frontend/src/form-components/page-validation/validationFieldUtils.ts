import { FieldValidationInput } from '../../components/shared/fieldValidation';
import { resolveCustomValidationRules } from '../custom-validation/customValidationRules';
import { isRequired, resolveValidation } from '../inputComponentUtils';
import { ValidationFieldsContext } from './validationFieldsTypes';

/** Shared mapping of authored constraints, including recognized legacy custom validation. */
const toFieldValidationInput = (context: ValidationFieldsContext): FieldValidationInput => ({
  statePath: context.submissionPath,
  label: context.component.label,
  required: isRequired(context.component),
  validation: {
    ...resolveValidation(context.component),
    ...resolveCustomValidationRules(context.component, context),
  },
});

export { toFieldValidationInput };
