import {
  Component,
  CustomLabels,
  dateUtils,
  SubmissionIdentity,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useStateField } from '../../context/state/useStateField';
import DatePicker from '../date/DatePicker';
import RadioGroup from '../radio-group/RadioGroup';
import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';

interface IdentityProps extends Pick<BaseFieldProps, 'statePath' | 'required' | 'readOnly'> {
  customLabels?: CustomLabels;
  prefillValue?: Component['prefillValue'];
}

const Identity = ({ statePath, required, readOnly, customLabels, prefillValue }: IdentityProps) => {
  const { stateValue, setStateValue } = useStateField({ statePath });
  const identity = stateValue as SubmissionIdentity | undefined;
  const showsPrefilledIdentityNumber = !!identity?.identitetsnummer && !identity?.harDuFodselsnummer;

  useEffect(() => {
    if (
      identity?.harDuFodselsnummer ||
      identity?.identitetsnummer ||
      identity?.fodselsdato ||
      typeof prefillValue !== 'string' ||
      prefillValue.trim() === ''
    ) {
      return;
    }

    setStateValue({ identitetsnummer: prefillValue });
  }, [identity, prefillValue, setStateValue]);

  if (readOnly) {
    return (
      <TextField
        statePath={`${statePath}.identitetsnummer`}
        label={TEXTS.statiske.identity.identityNumber}
        required={required}
        readOnly
        inputMode="numeric"
        formatKey="identityNumber"
        showOptionalText={false}
      />
    );
  }

  return (
    <>
      <RadioGroup
        statePath={`${statePath}.harDuFodselsnummer`}
        legend={customLabels?.doYouHaveIdentityNumber ?? TEXTS.statiske.identity.doYouHaveIdentityNumber}
        values={[
          { value: 'ja', label: TEXTS.common.yes },
          { value: 'nei', label: TEXTS.common.no },
        ]}
        required={required}
        showOptionalText={false}
      />
      {(identity?.harDuFodselsnummer === 'ja' || showsPrefilledIdentityNumber) && (
        <TextField
          statePath={`${statePath}.identitetsnummer`}
          label={TEXTS.statiske.identity.identityNumber}
          required={required}
          inputMode="numeric"
          formatKey="identityNumber"
          showOptionalText={false}
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
