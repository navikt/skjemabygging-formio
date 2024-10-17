import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressTextField from './AddressTextField';

interface Props {
  label?: string;
  required?: boolean;
}

const POBoxField = ({ label, required = false }: Props) => {
  const { address } = useAddress();

  return (
    <AddressTextField
      type="postboks"
      label={label ?? TEXTS.statiske.address.poBox}
      value={address?.postboks}
      required={required}
    ></AddressTextField>
  );
};

export default POBoxField;
