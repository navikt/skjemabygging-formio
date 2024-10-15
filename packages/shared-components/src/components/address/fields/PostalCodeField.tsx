import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressTextField from './AddressTextField';

interface Props {
  label?: string;
  required?: boolean;
}

const PostalCodeField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressTextField
      type="postnummer"
      label={label ?? TEXTS.statiske.address.postalCode}
      value={address?.postnummer}
      required={required}
      autoComplete="postal-code"
    ></AddressTextField>
  );
};

export default PostalCodeField;
