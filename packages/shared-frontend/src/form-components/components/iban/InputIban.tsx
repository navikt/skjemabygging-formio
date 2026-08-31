import TextField from '../../../components/text-field/TextField';
import { IbanDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputIban = ({ component, submissionPath }: InputComponentProps<IbanDefinition>) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      spellCheck={false}
      formatKey="iban"
    />
  </FormGroup>
);

export default InputIban;
