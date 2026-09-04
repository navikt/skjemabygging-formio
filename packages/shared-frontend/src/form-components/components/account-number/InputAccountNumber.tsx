import TextField from '../../../components/text-field/TextField';
import { AccountNumberDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAccountNumber = ({ component, submissionPath }: InputComponentProps<AccountNumberDefinition>) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      inputMode="numeric"
      spellCheck={false}
      formatKey="accountNumber"
    />
  </FormGroup>
);

export default InputAccountNumber;
