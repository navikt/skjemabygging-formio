import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressField from './AddressField';

interface Props {
  label?: string;
  required?: boolean;
}

const StreetAddressField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressField
      type="adresse"
      label={label ?? TEXTS.statiske.address.streetAddress}
      value={address?.adresse}
      required={required}
      autoComplete="street-address"
    ></AddressField>
  );
};

export default StreetAddressField;
