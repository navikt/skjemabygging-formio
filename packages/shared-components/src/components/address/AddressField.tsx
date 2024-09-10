import { TextField } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { AddressInputType } from './Address';
import { useAddress } from './addressContext';

interface Props {
  type: AddressInputType;
  label?: string;
}

type AddressLabelsMap = {
  [key in AddressInputType]: string;
};

export const AddressLabels: Partial<AddressLabelsMap> = {
  bygning: TEXTS.statiske.address.building,
  co: TEXTS.statiske.address.co,
  landkode: TEXTS.statiske.address.country,
  postboks: TEXTS.statiske.address.poBox,
  postnummer: TEXTS.statiske.address.postalCode,
  bySted: TEXTS.statiske.address.postalName,
  region: TEXTS.statiske.address.region,
  adresse: TEXTS.statiske.address.streetAddress,
};

const AddressField = ({ type, label }: Props) => {
  const { onChange, address, readOnly, className, required } = useAddress();
  const { translate, addRef, getComponentError } = useComponentUtils();

  const getValue = () => {
    switch (type) {
      case 'bygning':
        return address?.bygning;
      case 'co':
        return address?.co;
      case 'landkode':
        return address?.landkode; // TODO: Change with country name when we support that.
      case 'postboks':
        return address?.postboks;
      case 'postnummer':
        return address?.postnummer;
      case 'bySted':
        return address?.bySted;
      case 'region':
        return address?.region;
      case 'adresse':
        return address?.adresse;
    }
  };

  const getLabel = () => {
    if (label) {
      return label;
    }

    switch (type) {
      case 'bygning':
        return translateLabel(TEXTS.statiske.address.building);
      case 'co':
        return translateLabel(TEXTS.statiske.address.co);
      case 'landkode':
        return translateLabel(TEXTS.statiske.address.country);
      case 'postboks':
        return translateLabel(TEXTS.statiske.address.poBox);
      case 'postnummer':
        return translateLabel(TEXTS.statiske.address.postalCode);
      case 'bySted':
        return translateLabel(TEXTS.statiske.address.postalName);
      case 'region':
        return translateLabel(TEXTS.statiske.address.region);
      case 'adresse':
        return translateLabel(TEXTS.statiske.address.streetAddress);
    }
  };

  const translateLabel = (label: string) => {
    return required || readOnly ? translate(label) : `${translate(label)} (${translate('valgfritt')})`;
  };

  if (readOnly && !getValue()) {
    return <></>;
  }

  return (
    <TextField
      onChange={(event) => onChange(type, event.currentTarget.value)}
      defaultValue={getValue()}
      label={getLabel()}
      ref={(ref) => addRef(`address:${type}`, ref)}
      error={getComponentError(`address:${type}`)}
      readOnly={readOnly}
      className={classNames('form-group', className)}
    />
  );
};

export default AddressField;
