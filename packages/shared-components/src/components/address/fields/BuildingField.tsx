import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressField from './AddressField';

interface Props {
  label?: string;
  required?: boolean;
}

const BuildingField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressField
      type="bygning"
      label={label ?? TEXTS.statiske.address.building}
      value={address?.bygning}
      required={required}
    ></AddressField>
  );
};

export default BuildingField;