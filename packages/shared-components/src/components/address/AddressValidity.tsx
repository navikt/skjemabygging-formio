import {
  Address as AddressDomain,
  AddressType as AddressTypeDomain,
  SubmissionAddress,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AddressProvider } from './addressContext';
import ValidFromDate from './fields/ValidFromDate';
import ValidToDate from './fields/ValidToDate';

interface Props {
  addressType?: AddressTypeDomain;
  onChange: (value: SubmissionAddress) => void;
  address?: SubmissionAddress;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  addressTypeChoice?: boolean;
}

export type SubmissionAddressType = keyof SubmissionAddress;

const AddressValidity = ({ address, readOnly, required, className, onChange }: Props) => {
  const handleChange = (type: SubmissionAddressType, value: string) => {
    if (type) {
      onChange({
        ...address,
        [type]: value,
      } as AddressDomain);
    }
  };

  return (
    <AddressProvider
      address={address}
      readOnly={readOnly}
      required={required}
      className={className}
      onChange={handleChange}
    >
      <ValidFromDate />
      <ValidToDate />
    </AddressProvider>
  );
};

export default AddressValidity;
