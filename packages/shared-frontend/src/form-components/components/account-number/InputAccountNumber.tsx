import AccountNumber from '../../../components/account-number/AccountNumber';
import { AccountNumberDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputAccountNumber = ({ component, submissionPath }: InputComponentProps<AccountNumberDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <AccountNumber
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      validation={validation}
    />
  );
};

export default InputAccountNumber;
