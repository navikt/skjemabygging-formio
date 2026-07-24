import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
  resolveTextFormatKey,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputOrganizationNumber = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      type={resolveInputType(component)}
      spellCheck={component.spellCheck}
      formatKey={resolveTextFormatKey(component)}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputOrganizationNumber;
