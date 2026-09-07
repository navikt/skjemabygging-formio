import CurrencySelect from '../../../components/currency-select/CurrencySelect';
import { CurrencySelectDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputCurrencySelect = ({ component, submissionPath }: InputComponentProps<CurrencySelectDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <FormGroup>
      <CurrencySelect
        statePath={resolveSubmissionPath(component, submissionPath)}
        label={component.label}
        description={component.description}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        readMore={resolveReadMore(component)}
        validation={validation}
      />
    </FormGroup>
  );
};

export default InputCurrencySelect;
