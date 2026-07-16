import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputFirstName = ({ component, submissionPath }: InputComponentProps) => (
  <TextField
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    autoComplete={component.autocomplete}
    inputMode={component.inputType}
    type={resolveInputType(component)}
    spellCheck={component.spellCheck}
    prefillValue={component.prefillValue}
    readMore={resolveReadMore(component)}
  />
);

export default InputFirstName;
