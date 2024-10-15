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
    <AddressTextField type="co" label={label ?? TEXTS.statiske.address.co} value={address?.co} required={required}>
      <ReadMore header={translate('Hva er C/O?')}>
        {translate(
          'C/O brukes hvis ditt navn ikke står på den postkassen som posten er adressert til. Du oppgir da navnet på "eieren" av postkassen, som kan være navnet på en person eller et firma.',
        )}
      </ReadMore>
    </AddressTextField>
  );
};

export default CoField;
