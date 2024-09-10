import AddressField from './AddressField';

const NorwegianAddress = () => {
  return (
    <>
      <AddressField type="co" />
      <AddressField type="adresse" />
      <AddressField type="postnummer" />
      <AddressField type="bySted" />
    </>
  );
};

export default NorwegianAddress;
