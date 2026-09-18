import PhoneNumber from '../../../components/phone-number/PhoneNumber';
import { PhoneNumberDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputPhoneNumber = ({ component, submissionPath }: InputComponentProps<PhoneNumberDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <PhoneNumber
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      showAreaCode={component.showAreaCode}
      validation={validation}
    />
  );
};

export default InputPhoneNumber;
