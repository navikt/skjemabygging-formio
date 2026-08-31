import TextField from '../../../components/text-field/TextField';
import { narrowComponent } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

// Narrow the legacy `Component` to the typed `TextFieldComponent` at the top of
// the adapter. From here on, accessing a property that is not valid for a
// textfield (e.g. `component.values`) is a compile-time error.
const InputTextField = ({ component: rawComponent, submissionPath }: InputComponentProps) => {
  const component = narrowComponent(rawComponent, 'textfield');

  return (
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
};

export default InputTextField;
