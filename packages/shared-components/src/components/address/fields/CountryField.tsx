import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressField from './AddressField';

interface Props {
  label?: string;
  required?: boolean;
}

const CountryField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <div className="form-group">
      <AddressField
        type="land"
        label={label ?? TEXTS.statiske.address.country}
        value={address?.land}
        required={required}
      ></AddressField>
    </div>
  );
};

export default CountryField;
