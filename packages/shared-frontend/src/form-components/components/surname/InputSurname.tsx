import TextField from '../../../components/text-field/TextField';
import { SurnameDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputSurname = ({ component, submissionPath }: InputComponentProps<SurnameDefinition>) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      type={resolveInputType(component)}
      spellCheck={component.spellCheck}
      prefillValue={typeof component.prefillValue === 'string' ? component.prefillValue : undefined}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputSurname;
