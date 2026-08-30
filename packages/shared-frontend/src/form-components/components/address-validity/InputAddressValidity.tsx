import AddressValidity from '../../../components/address-validity/AddressValidity';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAddressValidity = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <AddressValidity
      statePath={resolveSubmissionPath(component, submissionPath)}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputAddressValidity;
