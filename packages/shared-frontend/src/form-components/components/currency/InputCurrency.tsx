import NumberField from '../../../components/number-field/NumberField';
import { CurrencyDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputCurrency = ({ component, submissionPath }: InputComponentProps<CurrencyDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <FormGroup>
      <NumberField
        statePath={resolveSubmissionPath(component, submissionPath)}
        label={component.label}
        description={component.description}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        autoComplete={component.autocomplete}
        inputMode={component.inputType}
        spellCheck={component.spellCheck}
        readOnly={component.readOnly}
        readMore={resolveReadMore(component)}
        numberType={component.inputType === 'numeric' ? 'integer' : 'decimal'}
        calculatedValue={!!component.calculateValue}
        validation={validation}
      />
    </FormGroup>
  );
};

export default InputCurrency;
