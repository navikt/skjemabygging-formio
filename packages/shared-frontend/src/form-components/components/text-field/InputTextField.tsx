import TextField from '../../../components/text-field/TextField';
import { TextFieldComponent } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

// `component` is typed as `TextFieldComponent` via the registry, so only valid
// textfield properties are accessible - reading e.g. `component.values` is a
// compile-time error.
const InputTextField = ({ component, submissionPath }: InputComponentProps<TextFieldComponent>) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      type={resolveInputType(component)}
      spellCheck={component.spellCheck}
      prefillValue={typeof component.prefillValue === 'string' ? component.prefillValue : undefined}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputTextField;
