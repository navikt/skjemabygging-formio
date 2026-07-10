import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';

type NationalIdentityNumberProps = BaseFieldProps;

const NationalIdentityNumber = ({
  statePath,
  label = TEXTS.statiske.identity.identityNumber,
  description,
  required,
  readOnly,
  marginBottom,
}: NationalIdentityNumberProps) => (
  <TextField
    statePath={statePath}
    label={label}
    description={description}
    required={required}
    readOnly={readOnly}
    inputMode="numeric"
    formatKey="identityNumber"
    marginBottom={marginBottom}
  />
);

export default NationalIdentityNumber;
export type { NationalIdentityNumberProps };
