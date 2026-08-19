import TextField from '../../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputYear = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      spellCheck={component.spellCheck}
      formatKey="year"
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputYear;
