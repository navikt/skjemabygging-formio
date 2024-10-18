import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import DatePicker from '../../datepicker/DatePicker';
import { useIdentity } from '../identityContext';

const BirthDateField = () => {
  const { translate, addRef, getComponentError } = useComponentUtils();
  const { nationalIdentity, onChange, className } = useIdentity();

  const handleChange = (value: string) => {
    onChange({
      ...nationalIdentity,
      fodselsdato: value,
    });
  };

  const refId = 'identity:fodselsdato';

  return (
    <DatePicker
      onChange={handleChange}
      className={className}
      label={translate(TEXTS.statiske.identity.yourBirthdate)}
      inputRef={(ref) => addRef(refId, ref)}
      error={getComponentError(refId)}
      value={nationalIdentity?.fodselsdato ?? ''}
      fromDate="1900"
      toDate={dateUtils.toSubmissionDate()}
    />
  );
};

export default BirthDateField;
