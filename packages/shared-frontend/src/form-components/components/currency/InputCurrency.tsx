import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveNumberDisplayValue,
  resolveNumberFormatKey,
  resolveNumericStateValue,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputCurrency = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      spellCheck={component.spellCheck}
      formatKey={resolveNumberFormatKey(component)}
      toDisplayValue={(value) => resolveNumberDisplayValue(component, value)}
      toStateValue={(value) => resolveNumericStateValue(component, value)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputCurrency;
