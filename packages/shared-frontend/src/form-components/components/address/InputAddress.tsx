import Address from '../../../components/address/Address';
import { AddressDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAddress = ({ component, submissionPath }: InputComponentProps<AddressDefinition>) => (
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
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
    />
  </FormGroup>
);

export default InputAddress;
