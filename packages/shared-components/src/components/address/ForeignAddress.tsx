import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { useAddress } from './addressContext';
import BuildingField from './fields/BuildingField';
import CoField from './fields/CoField';
import CountryField from './fields/CountryField';
import PostalCodeField from './fields/PostalCodeField';
import PostalNameField from './fields/PostalNameField';
import RegionField from './fields/RegionField';
import StreetAddressField from './fields/StreetAddressField';

const ForeignAddress = () => {
  const { translate } = useComponentUtils();
  const { required } = useAddress();

  return (
    <>
      <CoField />
      <StreetAddressField label={translate(TEXTS.statiske.address.streetAddressLong)} required={required} />
      <BuildingField />
      <PostalCodeField />
      <PostalNameField label={translate(TEXTS.statiske.address.location)} />
      <RegionField />
      <CountryField required={required} />
    </>
  );
};

export default ForeignAddress;
