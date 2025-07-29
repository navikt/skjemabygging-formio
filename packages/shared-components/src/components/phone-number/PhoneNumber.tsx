import { getNumericCountries } from '../../util/countries/countries';
import Combobox from '../select/Combobox';

interface Props {
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: React.ReactNode;
  readOnly?: boolean;
}

const PhoneNumber = ({ label, onChange }: Props) => {
  const countryCodes = getNumericCountries();
  return <Combobox label={label} onChange={onChange} options={countryCodes} />;
};

export default PhoneNumber;
