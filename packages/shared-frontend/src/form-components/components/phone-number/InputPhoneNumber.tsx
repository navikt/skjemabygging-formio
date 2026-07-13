import PhoneNumber from '../../../components/phone-number/PhoneNumber';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputPhoneNumber = ({ component, submissionPath }: InputComponentProps) => (
  <PhoneNumber
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
    showAreaCode={component.showAreaCode}
  />
);

export default InputPhoneNumber;
