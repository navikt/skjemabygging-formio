import { TextField } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { useIdentity } from '../identityContext';

const IdentityNumberField = () => {
  const { translate, addRef, getComponentError } = useComponentUtils();
  const { nationalIdentity, onChange, readOnly, className } = useIdentity();

  const handleChange = (value: string) => {
    onChange({
      ...nationalIdentity,
      identitetsnummer: value,
    });
  };

  const refId = 'identity:identitetsnummer';

  return (
    <TextField
      label={translate(TEXTS.statiske.identity.identityNumber)}
      value={nationalIdentity?.identitetsnummer}
      className={className}
      onChange={(event) => handleChange(event.currentTarget.value)}
      ref={(ref) => addRef(refId, ref)}
      error={getComponentError(refId)}
      readOnly={readOnly}
    />
  );
};

export default IdentityNumberField;
