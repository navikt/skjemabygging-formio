import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputFirstName = ({ component, submissionPath }: InputComponentProps) => (
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

export default InputFirstName;
