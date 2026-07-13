import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputYear = ({ component, submissionPath }: InputComponentProps) => (
  <TextField
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    autoComplete={component.autocomplete}
    inputMode={component.inputType}
    spellCheck={component.spellCheck}
    readMore={resolveReadMore(component)}
  />
);

export default InputYear;
