import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressField from './AddressField';

interface Props {
  label?: string;
  required?: boolean;
}

const RegionField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressField
      type="region"
      label={label ?? TEXTS.statiske.address.region}
      value={address?.region}
      required={required}
    ></AddressField>
  );
};

export default RegionField;
