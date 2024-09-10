import AddressField from './AddressField';
import { useAddress } from './addressContext';

const PostOfficeBox = () => {
  const { required } = useAddress();

  return (
    <>
      <AddressField type="co" />
      <AddressField type="postboks" required={required} />
      <AddressField type="postnummer" required={required} />
      <AddressField type="bySted" required={required} />
    </>
  );
};

export default PostOfficeBox;
