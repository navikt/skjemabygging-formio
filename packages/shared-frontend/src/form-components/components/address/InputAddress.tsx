import Address from '../../../components/address/Address';
import { AddressDefinition } from '../../component-types';
import { InputComponentProps, isRequired, resolveFieldSize, resolveSubmissionPath } from '../../inputComponentUtils';

const InputAddress = ({ component, submissionPath }: InputComponentProps<AddressDefinition>) => (
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
);

export default InputAddress;
