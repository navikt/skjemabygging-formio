import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveInputType,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputTextField = ({ component, submissionPath }: InputComponentProps) => (
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
  />
);

export default InputTextField;
