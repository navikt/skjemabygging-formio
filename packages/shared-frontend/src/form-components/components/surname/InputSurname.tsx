import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputSurname = ({ component, submissionPath }: InputComponentProps) => (
  <TextField
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    autoComplete={component.autocomplete}
    inputMode={component.inputType}
    type={resolveInputType(component)}
    spellCheck={component.spellCheck}
    readMore={resolveReadMore(component)}
  />
);

export default InputSurname;
