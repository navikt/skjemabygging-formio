import {
  Address as AddressDomain,
  AddressType as AddressTypeDomain,
  CustomLabels,
  SubmissionAddress,
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
}: Props) => {
  const getAddress = () => {
    if (
      addressType === 'NORWEGIAN_ADDRESS' ||
      (address?.borDuINorge === 'ja' && address?.vegadresseEllerPostboksadresse === 'vegadresse')
    ) {
      return <NorwegianAddress />;
    } else if (
      addressType === 'POST_OFFICE_BOX' ||
      (address?.borDuINorge === 'ja' && address?.vegadresseEllerPostboksadresse === 'postboksadresse')
    ) {
      return <PostOfficeBox />;
    } else if (addressType === 'FOREIGN_ADDRESS' || address?.borDuINorge === 'nei') {
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
          onChange={handleChange}
        >
          {getAddress()}
        </AddressProvider>
      )}
    </>
  );
};

export default Address;
