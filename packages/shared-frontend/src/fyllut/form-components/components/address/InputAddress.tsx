import Address from '../../../../components/address/Address';
import { InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAddress = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <Address
      statePath={resolveSubmissionPath(component, submissionPath)}
      addressPriority={component.addressPriority}
      addressType={component.addressType}
      addressTypeWizard={component.addressTypeWizard}
      prefillKey={component.prefillKey}
      prefillValue={component.prefillValue}
      customLabels={component.customLabels}
      required={isRequired(component)}
      readOnly={component.readOnly}
    />
  </FormGroup>
);

export default InputAddress;
