import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import countries from 'i18n-iso-countries';
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

  const getValue = () => {
    if (address?.land) {
      return address?.land;
    } else if (address?.landkode) {
      if (address.landkode.length === 3) {
        return countries.alpha3ToAlpha2(address.landkode);
      } else {
        return address.landkode;
      }
    }
  };

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
        value={getValue()}
        fieldSize={fieldSize}
        ref={(ref) => addRef('address:land', ref)}
        error={getComponentError('address:land')}
        readOnly={readOnly}
      />
    </>
  );
};

export default ForeignAddress;
