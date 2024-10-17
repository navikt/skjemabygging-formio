import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressTextField from './AddressTextField';

interface Props {
  label?: string;
  required?: boolean;
}

const BuildingField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressTextField
      type="bygning"
      label={label ?? TEXTS.statiske.address.building}
      value={address?.bygning}
      required={required}
    ></AddressTextField>
  );
};

export default BuildingField;
