import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import AddressField from './AddressField';

const ForeignAddress = () => {
  const { translate } = useComponentUtils();

  return (
    <>
      <AddressField type="co" />
      <AddressField type="adresse" label={translate(TEXTS.statiske.address.streetAddressLong)} />
      <AddressField type="bygning" />
      <AddressField type="postnummer" />
      <AddressField type="bySted" label={translate(TEXTS.statiske.address.location)} />
      <AddressField type="region" />
      <AddressField type="landkode" />
    </>
  );
};

export default ForeignAddress;
