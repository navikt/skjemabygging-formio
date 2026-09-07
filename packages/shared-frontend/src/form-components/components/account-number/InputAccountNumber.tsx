import AccountNumber from '../../../components/account-number/AccountNumber';
import { AccountNumberDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAccountNumber = ({ component, submissionPath }: InputComponentProps<AccountNumberDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <FormGroup>
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
    </FormGroup>
  );
};

export default InputAccountNumber;
