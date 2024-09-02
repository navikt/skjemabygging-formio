import { Address as AddressDomain, AddressType as AddressTypeDomain } from '@navikt/skjemadigitalisering-shared-domain';
import { AddressProvider } from './addressContext';
import AddressTypeChoice from './AddressTypeChoice';
import ForeignAddress from './ForeignAddress';
import NorwegianAddress from './NorwegianAddress';
import PostOfficeBox from './PostOfficeBox';

interface Props {
  addressType?: AddressTypeDomain;
  addressTypeUserSelect?: boolean;
  onChange: (value: AddressDomain) => void;
  address?: AddressDomain;
  readOnly?: boolean;
  className?: string;
  hideIfEmpty?: boolean;
}

export interface AddressInput extends AddressDomain {
  borDuINorge?: string;
  vegadresseEllerPostboksadresse?: string;
}
export type AddressInputType = keyof AddressInput;

const Address = ({ addressType, address, readOnly, className, hideIfEmpty, onChange }: Props) => {
  //const [type, setType] = useState<AddressTypeDomain>(addressType);

  const getAddress = () => {
    switch (addressType) {
      case 'NORWEGIAN_ADDRESS':
        return <NorwegianAddress />;
      case 'POST_OFFICE_BOX':
        return <PostOfficeBox />;
      case 'FOREIGN_ADDRESS':
        return <ForeignAddress />;
    }
  };

  const handleChange = (type: AddressInputType, value: string) => {
    if (type) {
      onChange({
        ...address,
        [type]: value,
      } as AddressDomain);
    }
  };

  console.log(addressType);
  return (
    <>
      {!addressType && <AddressTypeChoice values={address as AddressInput} onChange={handleChange} />}
      <AddressProvider
        address={address}
        readOnly={readOnly}
        className={className}
        hideIfEmpty={hideIfEmpty}
        onChange={handleChange}
      >
        {getAddress()}
      </AddressProvider>
    </>
  );
};

export default Address;
