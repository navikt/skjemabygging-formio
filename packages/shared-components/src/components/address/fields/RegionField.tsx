import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressTextField from './AddressTextField';

interface Props {
  label?: string;
  required?: boolean;
}

const RegionField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressTextField
      type="region"
      label={label ?? TEXTS.statiske.address.region}
      value={address?.region}
      required={required}
      autoComplete="address-level1"
    ></AddressTextField>
  );
};

export default RegionField;
