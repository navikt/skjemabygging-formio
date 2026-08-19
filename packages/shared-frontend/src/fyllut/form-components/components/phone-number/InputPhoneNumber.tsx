import PhoneNumber from '../../../../components/phone-number/PhoneNumber';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputPhoneNumber = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <PhoneNumber
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      showAreaCode={component.showAreaCode}
    />
  </FormGroup>
);

export default InputPhoneNumber;
