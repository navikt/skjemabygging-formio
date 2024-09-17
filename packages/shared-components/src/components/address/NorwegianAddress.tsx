import { useAddress } from './addressContext';
import CoField from './fields/CoField';
import PostalCodeField from './fields/PostalCodeField';
import PostalNameField from './fields/PostalNameField';
import StreetAddressField from './fields/StreetAddressField';

const NorwegianAddress = () => {
  const { required } = useAddress();

  return (
    <>
      <CoField />
      <StreetAddressField required={required} />
      <PostalCodeField required={required} />
      <PostalNameField required={required} />
    </>
  );
};

export default NorwegianAddress;
