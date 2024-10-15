import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import DatePicker from '../../datepicker/DatePicker';
import { SubmissionAddressType } from '../Address';
import { useAddress } from '../addressContext';

interface Props {
  type: SubmissionAddressType;
  label: string;
  description?: string;
  value?: string;
  required?: boolean;
  fromDate?: string;
  toDate?: string;
}

const AddressDatePicker = ({ type, label, description, value, required = false, fromDate, toDate }: Props) => {
  const { onChange, readOnly, className } = useAddress();
  const { translate, addRef, getComponentError } = useComponentUtils();

  const translateLabel = (text?: string) => {
    if (!text) {
      return undefined;
    }
    return required || readOnly ? translate(text) : `${translate(text)} (${translate('valgfritt')})`;
  };

  if (readOnly && !value) {
    return <></>;
  }

  return (
    <div className="form-group">
      <DatePicker
        onChange={(val) => onChange(type, val)}
        value={value ?? ''}
        label={translateLabel(label)}
        description={translateLabel(description)}
        inputRef={(ref) => addRef(type, ref)}
        error={getComponentError(type)}
        readOnly={readOnly}
        className={className}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
};

export default AddressDatePicker;
