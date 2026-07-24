import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveNumberFormatKey,
  resolveNumericStateValue,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputNumber = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      spellCheck={component.spellCheck}
      formatKey={resolveNumberFormatKey(component)}
      toStateValue={(value) => resolveNumericStateValue(component, value)}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputNumber;
