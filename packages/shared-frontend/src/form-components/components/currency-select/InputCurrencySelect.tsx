import CurrencySelect from '../../../components/currency-select/CurrencySelect';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputCurrencySelect = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <CurrencySelect
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputCurrencySelect;
