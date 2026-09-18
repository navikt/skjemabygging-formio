import TextField from '../../../components/text-field/TextField';
import { TextFieldDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputTextField = ({ component, submissionPath }: InputComponentProps<TextFieldDefinition>) => {
  const validation = useResolvedValidation(component);

  return (
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      spellCheck={component.spellCheck}
      prefillValue={typeof component.prefillValue === 'string' ? component.prefillValue : undefined}
      readMore={resolveReadMore(component)}
      validation={validation}
    />
  );
};

export default InputTextField;
