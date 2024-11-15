import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import CountrySelect from '../select/country/CountrySelect';
import { useAddress } from './addressContext';
import BuildingField from './fields/BuildingField';
import CoField from './fields/CoField';
import PostalCodeField from './fields/PostalCodeField';
import PostalNameField from './fields/PostalNameField';
import RegionField from './fields/RegionField';
import StreetAddressField from './fields/StreetAddressField';

const ForeignAddress = () => {
  const { translate, addRef, getComponentError } = useComponentUtils();
  const { required, onChange, address, fieldSize, readOnly } = useAddress();

  return (
    <>
      <CoField />
      <StreetAddressField label={translate(TEXTS.statiske.address.streetAddressLong)} required={required} />
      <BuildingField />
      <PostalCodeField />
      <PostalNameField label={translate(TEXTS.statiske.address.location)} />
      <RegionField />
      <CountrySelect
        label={translate(TEXTS.statiske.address.country)}
        onChange={(country) => onChange('land', country)}
        value={address?.land ?? address?.landkode}
        fieldSize={fieldSize}
        ref={(ref) => addRef('address:land', ref)}
        error={getComponentError('address:land')}
        readOnly={readOnly}
      />
    </>
  );
};

export default ForeignAddress;
