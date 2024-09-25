import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressField from './AddressField';

interface Props {
  label?: string;
  required?: boolean;
}

const PostalCodeField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressField
      type="postnummer"
      label={label ?? TEXTS.statiske.address.postalCode}
      value={address?.postnummer}
      required={required}
    ></AddressField>
  );
};

export default PostalCodeField;