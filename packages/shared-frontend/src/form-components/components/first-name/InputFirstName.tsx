import TextField from '../../../components/text-field/TextField';
import { toCoverPageTextFieldValidation } from '../../../components/text-field/textFieldValidation';
import { TextFieldValidation } from '../../../components/types';
import { FirstNameDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputFirstName = ({ component, submissionPath }: InputComponentProps<FirstNameDefinition>) => {
  const validation = useResolvedValidation(component);
  const statePath = resolveSubmissionPath(component, submissionPath);
  const fieldValidation = toCoverPageTextFieldValidation({
    statePath,
    label: component.label,
    required: isRequired(component),
    validation,
  });
  return (
    <TextField
      statePath={statePath}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      autoComplete={component.autocomplete}
      inputMode={component.inputType}
      spellCheck={component.spellCheck}
      prefillValue={typeof component.prefillValue === 'string' ? component.prefillValue : undefined}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      validation={fieldValidation.rules as TextFieldValidation}
    />
  );
};

export default InputFirstName;
