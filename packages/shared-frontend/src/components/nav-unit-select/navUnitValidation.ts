import { toFieldValidation } from '../shared/fieldValidation';
import { BaseFieldProps } from '../types';

type NavUnitValidationInput = Pick<BaseFieldProps, 'statePath' | 'label' | 'required'>;

const toNavUnitValidation = (input: NavUnitValidationInput) => toFieldValidation(input);

export { toNavUnitValidation };
