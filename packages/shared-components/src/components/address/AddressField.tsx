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

const AddressField = ({ type, label }: Props) => {
  const { onChange, address, readOnly, className, hideIfEmpty } = useAddress();
  const { translate } = useComponentUtils();

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
        return translate(TEXTS.statiske.address.building);
      case 'co':
        return translate(TEXTS.statiske.address.co);
      case 'landkode':
        return translate(TEXTS.statiske.address.country);
      case 'postboks':
        return translate(TEXTS.statiske.address.poBox);
      case 'postnummer':
        return translate(TEXTS.statiske.address.postalCode);
      case 'bySted':
        return translate(TEXTS.statiske.address.postalName);
      case 'region':
        return translate(TEXTS.statiske.address.region);
      case 'adresse':
        return translate(TEXTS.statiske.address.streetAddress);
    }
  };

  if (hideIfEmpty && readOnly && !getValue()) {
    return <></>;
  }

  return (
    <TextField
      onChange={(event) => onChange(type, event.currentTarget.value)}
      defaultValue={getValue()}
      label={getLabel()}
      readOnly={readOnly}
      className={classNames('form-group', className)}
    />
  );
};

export default AddressField;
