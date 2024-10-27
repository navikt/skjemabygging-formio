import { TextField } from '@navikt/ds-react';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { SubmissionAddressType } from '../Address';
import { useAddress } from '../addressContext';

interface Props {
  type: SubmissionAddressType;
  label: string;
  description?: string;
  value?: string;
  required?: boolean;
  children?: React.ReactNode;
  autoComplete?: string;
}

const AddressTextField = ({ type, label, value, required = false, children, autoComplete }: Props) => {
  const { onChange, readOnly, className } = useAddress();
  const { translate, addRef, getComponentError } = useComponentUtils();

  const translateLabel = (text: string) => {
    return required || readOnly ? translate(text) : `${translate(text)} (${translate('valgfritt')})`;
  };

  if (readOnly && !value) {
    return <></>;
  }

  return (
    <div className="form-group">
      <TextField
        onChange={(event) => onChange(type, event.currentTarget.value)}
        defaultValue={value}
        label={translateLabel(label)}
        ref={(ref) => addRef(`address:${type}`, ref)}
        error={getComponentError(`address:${type}`)}
        readOnly={readOnly}
        className={className}
        autoComplete={autoComplete}
      />
      {children}
    </div>
  );
};

export default AddressTextField;
