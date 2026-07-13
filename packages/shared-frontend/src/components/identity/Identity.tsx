import { dateUtils, SubmissionIdentity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useStateField } from '../../context/state/useStateField';
import DatePicker from '../date/DatePicker';
import RadioGroup from '../radio-group/RadioGroup';
import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';

type IdentityProps = Pick<BaseFieldProps, 'statePath' | 'label' | 'required' | 'readOnly'>;

const Identity = ({ statePath, label, required, readOnly }: IdentityProps) => {
  const { stateValue } = useStateField({ statePath });
  const identity = stateValue as SubmissionIdentity | undefined;

  if (readOnly) {
    return (
      <TextField
        statePath={`${statePath}.identitetsnummer`}
        label={TEXTS.statiske.identity.identityNumber}
        required={required}
        readOnly
        inputMode="numeric"
        formatKey="identityNumber"
      />
    );
  }

  return (
    <>
      <RadioGroup
        statePath={`${statePath}.harDuFodselsnummer`}
        legend={label ?? TEXTS.statiske.identity.doYouHaveIdentityNumber}
        values={[
          { value: 'ja', label: TEXTS.common.yes },
          { value: 'nei', label: TEXTS.common.no },
        ]}
        required={required}
      />
      {identity?.harDuFodselsnummer === 'ja' && (
        <TextField
          statePath={`${statePath}.identitetsnummer`}
          label={TEXTS.statiske.identity.identityNumber}
          required={required}
          inputMode="numeric"
          formatKey="identityNumber"
        />
      )}
      {identity?.harDuFodselsnummer === 'nei' && (
        <DatePicker
          statePath={`${statePath}.fodselsdato`}
          label={TEXTS.statiske.identity.yourBirthdate}
          required={required}
          fromDate="1900-01-01"
          toDate={dateUtils.toSubmissionDate()}
        />
      )}
    </>
  );
};

export default Identity;
export type { IdentityProps };
