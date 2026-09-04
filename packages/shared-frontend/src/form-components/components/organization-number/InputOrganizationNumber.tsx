import TextField from '../../../components/text-field/TextField';
import { OrganizationNumberDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
  resolveTextFormatKey,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputOrganizationNumber = ({ component, submissionPath }: InputComponentProps<OrganizationNumberDefinition>) => (
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
      formatKey={resolveTextFormatKey(component)}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputOrganizationNumber;
