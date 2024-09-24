import { TextField } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { useIdentity } from '../identityContext';

const IdentityNumberField = () => {
  const { translate } = useComponentUtils();
  const { nationalIdentity, onChange, readOnly, className } = useIdentity();

  const handleChange = (value: string) => {
    onChange({
      ...nationalIdentity,
      identifikasjonsnummer: value,
    });
  };

  return (
    <TextField
      label={translate(TEXTS.statiske.nationalIdentityNumber.identityNumber)}
      value={nationalIdentity?.identifikasjonsnummer}
      className={className}
      onChange={(event) => handleChange(event.currentTarget.value)}
      readOnly={readOnly}
    />
  );
};

export default IdentityNumberField;
