import AddressField from './AddressField';

const PostOfficeBox = () => {
  return (
    <>
      <AddressField type="co" />
      <AddressField type="postboks" />
      <AddressField type="postnummer" />
      <AddressField type="bySted" />
    </>
  );
};

export default PostOfficeBox;
