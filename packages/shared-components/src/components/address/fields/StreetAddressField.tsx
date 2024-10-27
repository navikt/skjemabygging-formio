import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressTextField from './AddressTextField';

interface Props {
  label?: string;
  required?: boolean;
}

const StreetAddressField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressTextField
      type="adresse"
      label={label ?? TEXTS.statiske.address.streetAddress}
      value={address?.adresse}
      required={required}
      autoComplete="street-address"
    ></AddressTextField>
  );
};

export default StreetAddressField;
