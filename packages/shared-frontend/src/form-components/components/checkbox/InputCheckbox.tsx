import Checkbox from '../../../components/checkbox/Checkbox';
import { CheckboxDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputCheckbox = ({ component, submissionPath }: InputComponentProps<CheckboxDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <Checkbox
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      showInlineError
      validation={validation}
    />
  );
};

export default InputCheckbox;
