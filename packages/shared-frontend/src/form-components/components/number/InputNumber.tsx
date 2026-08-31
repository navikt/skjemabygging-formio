import TextField from '../../../components/text-field/TextField';
import { NumberDefinition } from '../../component-types';
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

const InputNumber = ({ component, submissionPath }: InputComponentProps<NumberDefinition>) => (
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

export default InputNumber;
