import AccountNumber from '../../../components/account-number/AccountNumber';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputAccountNumber = ({ component, submissionPath }: InputComponentProps) => (
  <AccountNumber
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
  />
);

export default InputAccountNumber;
