import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressField from './AddressField';

interface Props {
  label?: string;
  required?: boolean;
}

const POBoxField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <div className="form-group">
      <AddressField
        type="postboks"
        label={label ?? TEXTS.statiske.address.poBox}
        value={address?.postboks}
        required={required}
      ></AddressField>
    </div>
  );
};

export default POBoxField;
