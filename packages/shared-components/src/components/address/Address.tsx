import {
  Address as AddressDomain,
  AddressType as AddressTypeDomain,
  CustomLabels,
  FieldSize,
  SubmissionAddress,
  resolveAddressType,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AddressProvider } from './addressContext';
import AddressTypeChoice from './AddressTypeChoice';
import ForeignAddress from './ForeignAddress';
import NorwegianAddress from './NorwegianAddress';
import PostOfficeBox from './PostOfficeBox';

interface Props {
  addressType?: AddressTypeDomain;
  onChange: (value: SubmissionAddress) => void;
  address?: SubmissionAddress;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  addressTypeChoice?: boolean;
  customLabels?: CustomLabels;
  fieldSize?: FieldSize;
}

export type SubmissionAddressType = keyof SubmissionAddress;

const Address = ({
  addressType,
  address,
  readOnly,
  required,
  className,
  onChange,
  addressTypeChoice,
  customLabels,
  fieldSize,
}: Props) => {
  const getAddress = () => {
    switch (resolveAddressType(address, addressType)) {
      case 'NORWEGIAN_ADDRESS':
        return <NorwegianAddress />;
      case 'POST_OFFICE_BOX':
        return <PostOfficeBox />;
      case 'FOREIGN_ADDRESS':
        return <ForeignAddress />;
    }
  };

  const handleChange = (type: SubmissionAddressType, value: string) => {
    if (type) {
      onChange({
        ...address,
        [type]: value,
      } as AddressDomain);
    }
  };

  const showAddress = () => {
    return addressType || address?.borDuINorge === 'nei' || !!address?.vegadresseEllerPostboksadresse;
  };

  return (
    <>
      {addressTypeChoice && (
        <AddressTypeChoice
          values={address as SubmissionAddress}
          onChange={handleChange}
          label={customLabels?.livesInNorway}
        />
      )}
      {showAddress() && (
        <AddressProvider
          address={address}
          readOnly={readOnly}
          required={required}
          className={className}
          fieldSize={fieldSize}
          onChange={handleChange}
        >
          {getAddress()}
        </AddressProvider>
      )}
    </>
  );
};

export default Address;
