import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveInputType,
  resolveSubmissionPath,
  resolveTextFormatKey,
} from '../../inputComponentRegistryUtils';

const InputOrganizationNumber = ({ component, submissionPath }: InputComponentProps) => (
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
  />
);

export default InputOrganizationNumber;
