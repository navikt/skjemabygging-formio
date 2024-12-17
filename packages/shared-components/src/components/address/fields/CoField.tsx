import { ReadMore } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { useAddress } from '../addressContext';
import AddressTextField from './AddressTextField';

interface Props {
  label?: string;
  required?: boolean;
}

const CoField = ({ label, required = false }: Props) => {
  const { address } = useAddress();
  const { translate } = useComponentUtils();

  return (
    <AddressTextField
      type="co"
      label={label ?? TEXTS.statiske.address.co.label}
      value={address?.co}
      required={required}
    >
      <ReadMore header={translate(TEXTS.statiske.address.co.readMore.header)}>
        {translate(TEXTS.statiske.address.co.readMore.content)}
      </ReadMore>
    </AddressTextField>
  );
};

export default CoField;
