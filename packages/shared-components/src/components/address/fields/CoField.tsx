import { ReadMore } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { useAddress } from '../addressContext';
import AddressField from './AddressField';

interface Props {
  label?: string;
  required?: boolean;
}

const CoField = ({ label, required = false }: Props) => {
  const { address } = useAddress();
  const { translate } = useComponentUtils();

  return (
    <div className="mb-4">
      <AddressField
        type="co"
        label={label ?? TEXTS.statiske.address.co}
        value={address?.co}
        required={required}
      ></AddressField>
      <ReadMore header={translate('Hva er C/O?')}>
        {translate(
          'C/O brukes hvis ditt navn ikke står på den postkassen som posten er adressert til. Du oppgir da navnet på "eieren" av postkassen, som kan være navnet på en person eller et firma.',
        )}
      </ReadMore>
    </div>
  );
};

export default CoField;
