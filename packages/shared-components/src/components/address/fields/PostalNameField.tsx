import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressField from './AddressField';

interface Props {
  label?: string;
  required?: boolean;
}

const PostalNameField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressField
      type="bySted"
      label={label ?? TEXTS.statiske.address.postalName}
      value={address?.bySted}
      required={required}
    ></AddressField>
  );
};

export default PostalNameField;
