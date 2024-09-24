import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import DatePicker from '../../datepicker/DatePicker';
import { useIdentity } from '../identityContext';

const BirthDateField = () => {
  const { translate } = useComponentUtils();
  const { nationalIdentity, onChange, className } = useIdentity();

  const handleChange = (value: string) => {
    onChange({
      ...nationalIdentity,
      fodselsdato: value,
    });
  };

  return (
    <DatePicker
      onChange={handleChange}
      className={className}
      label={translate(TEXTS.statiske.nationalIdentityNumber.yourBirthdate)}
      value={nationalIdentity?.fodselsdato ?? ''}
    />
  );
};

export default BirthDateField;
