import Year from '../../../components/year/Year';
import { YearDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputYear = ({ component, submissionPath }: InputComponentProps<YearDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <FormGroup>
      <Year
        statePath={resolveSubmissionPath(component, submissionPath)}
        label={component.label}
        description={component.description}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        autoComplete={component.autocomplete}
        inputMode={component.inputType}
        spellCheck={component.spellCheck}
        readMore={resolveReadMore(component)}
        validation={validation}
      />
    </FormGroup>
  );
};

export default InputYear;
