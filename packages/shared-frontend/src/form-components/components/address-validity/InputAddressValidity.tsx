import AddressValidity from '../../../components/address-validity/AddressValidity';
import { AddressValidityDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputAddressValidity = ({ component, submissionPath }: InputComponentProps<AddressValidityDefinition>) => (
  <AddressValidity
    statePath={resolveSubmissionPath(component, submissionPath)}
    required={isRequired(component)}
    fieldSize={resolveFieldSize(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
  />
);

export default InputAddressValidity;
