import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressTextField from './AddressTextField';

interface Props {
  label?: string;
  required?: boolean;
}

const CountryField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressTextField
      type="land"
      label={label ?? TEXTS.statiske.address.country}
      value={address?.land}
      required={required}
      autoComplete="country-name"
    ></AddressTextField>
  );
};

export default CountryField;
