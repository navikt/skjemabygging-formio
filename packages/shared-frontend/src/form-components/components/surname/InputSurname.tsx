import TextField from '../../../components/text-field/TextField';
import { toCoverPageTextFieldValidation } from '../../../components/text-field/textFieldValidation';
import { TextFieldValidation } from '../../../components/types';
import { SurnameDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveInputType,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputSurname = ({ component, submissionPath }: InputComponentProps<SurnameDefinition>) => {
  const validation = useResolvedValidation(component);
  const statePath = resolveSubmissionPath(component, submissionPath);
  const fieldValidation = toCoverPageTextFieldValidation({
    statePath,
    label: component.label,
    required: isRequired(component),
    validation,
  });
  return (
    <FormGroup>
      <TextField
        statePath={statePath}
        label={component.label}
        description={component.description}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        autoComplete={component.autocomplete}
        inputMode={component.inputType}
        type={resolveInputType(component)}
        spellCheck={component.spellCheck}
        prefillValue={typeof component.prefillValue === 'string' ? component.prefillValue : undefined}
        readOnly={component.readOnly}
        readMore={resolveReadMore(component)}
        validation={fieldValidation.rules as TextFieldValidation}
      />
    </FormGroup>
  );
};

export default InputSurname;
