import { TextField } from '@navikt/ds-react';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { AddressInputType } from '../Address';
import { useAddress } from '../addressContext';

interface Props {
  type: AddressInputType;
  label: string;
  value?: string;
  required?: boolean;
}

const AddressField = ({ type, label, value, required = false }: Props) => {
  const { onChange, readOnly, className } = useAddress();
  const { translate, addRef, getComponentError } = useComponentUtils();

  const translateLabel = (label: string) => {
    return required || readOnly ? translate(label) : `${translate(label)} (${translate('valgfritt')})`;
  };

  if (readOnly && !value) {
    return <></>;
  }

  return (
    <TextField
      onChange={(event) => onChange(type, event.currentTarget.value)}
      defaultValue={value}
      label={translateLabel(label)}
      ref={(ref) => addRef(`address:${type}`, ref)}
      error={getComponentError(`address:${type}`)}
      readOnly={readOnly}
      className={className}
    />
  );
};

export default AddressField;
