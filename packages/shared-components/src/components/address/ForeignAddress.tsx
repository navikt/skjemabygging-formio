import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import AddressField from './AddressField';
import { useAddress } from './addressContext';

const ForeignAddress = () => {
  const { translate } = useComponentUtils();
  const { required } = useAddress();

  return (
    <>
      <AddressField type="co" />
      <AddressField type="adresse" label={translate(TEXTS.statiske.address.streetAddressLong)} required={required} />
      <AddressField type="bygning" />
      <AddressField type="postnummer" />
      <AddressField type="bySted" label={translate(TEXTS.statiske.address.location)} />
      <AddressField type="region" />
      <AddressField type="landkode" required={required} />
    </>
  );
};

export default ForeignAddress;
