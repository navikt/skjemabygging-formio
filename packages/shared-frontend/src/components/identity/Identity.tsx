import { CustomLabels, dateUtils, SubmissionIdentity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useStateField } from '../../context/state/useStateField';
import DatePicker from '../date/DatePicker';
import NationalIdentityNumber from '../national-identity-number/NationalIdentityNumber';
import RadioGroup from '../radio-group/RadioGroup';
import { BaseFieldProps } from '../types';
import { showsPrefilledIdentityNumber } from './identityValidation';

interface IdentityProps extends Pick<BaseFieldProps, 'statePath' | 'required' | 'readOnly'> {
  customLabels?: CustomLabels;
  prefillValue?: string;
}

const Identity = ({ statePath, required = true, readOnly, customLabels, prefillValue }: IdentityProps) => {
  const { stateValue, setStateValue } = useStateField({ statePath });
  const identity = stateValue as SubmissionIdentity | undefined;
  const isPrefilled = showsPrefilledIdentityNumber(identity);

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
      <NationalIdentityNumber
        statePath={`${statePath}.identitetsnummer`}
        label={TEXTS.statiske.identity.identityNumber}
        required={required}
        readOnly
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
        // A prefilled identity number answers the question, so it is not asked again.
        required={required && !isPrefilled}
        showOptionalText={false}
      />
      {(identity?.harDuFodselsnummer === 'ja' || isPrefilled) && (
        <NationalIdentityNumber
          statePath={`${statePath}.identitetsnummer`}
          label={TEXTS.statiske.identity.identityNumber}
          required={required}
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
