import { useAddress } from './addressContext';
import CoField from './fields/CoField';
import POBoxField from './fields/POBoxField';
import PostalCodeField from './fields/PostalCodeField';
import PostalNameField from './fields/PostalNameField';

const PostOfficeBox = () => {
  const { required } = useAddress();

  return (
    <>
      <CoField />
      <POBoxField required={required} />
      <PostalCodeField required={required} />
      <PostalNameField required={required} />
    </>
  );
};

export default PostOfficeBox;
