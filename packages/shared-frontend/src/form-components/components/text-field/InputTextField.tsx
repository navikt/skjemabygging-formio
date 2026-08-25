import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputTextField = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      readOnly={component.readOnly}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      type={resolveInputType(component)}
      spellCheck={component.spellCheck}
      prefillValue={component.prefillValue}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputTextField;
