import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressTextField from './AddressTextField';

interface Props {
  label?: string;
  required?: boolean;
}

const PostalNameField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressTextField
      type="bySted"
      label={label ?? TEXTS.statiske.address.postalName}
      value={address?.bySted}
      required={required}
      autoComplete="address-level2"
    ></AddressTextField>
  );
};

export default PostalNameField;
