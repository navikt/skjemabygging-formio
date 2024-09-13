import AddressField from './AddressField';
import { useAddress } from './addressContext';

const NorwegianAddress = () => {
  const { required } = useAddress();

  return (
    <>
      <AddressField type="co" />
      <AddressField type="adresse" required={required} />
      <AddressField type="postnummer" required={required} />
      <AddressField type="bySted" required={required} />
    </>
  );
};

export default NorwegianAddress;
