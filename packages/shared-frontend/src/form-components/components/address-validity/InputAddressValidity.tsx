import AddressValidity from '../../../components/address-validity/AddressValidity';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputAddressValidity = ({ component, submissionPath }: InputComponentProps) => (
  <AddressValidity
    statePath={resolveSubmissionPath(component, submissionPath)}
    required={isRequired(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
  />
);

export default InputAddressValidity;
