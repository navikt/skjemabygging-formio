import { dateUtils, SubmissionIdentity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useStateField } from '../../context/state/useStateField';
import DatePicker from '../date/DatePicker';
import NationalIdentityNumber from '../national-identity-number/NationalIdentityNumber';
import RadioGroup from '../radio-group/RadioGroup';
import { BaseFieldProps } from '../types';

type IdentityProps = Pick<BaseFieldProps, 'statePath' | 'label' | 'required' | 'readOnly'>;

const Identity = ({ statePath, label, required, readOnly }: IdentityProps) => {
  const { stateValue } = useStateField({ statePath });
  const identity = stateValue as SubmissionIdentity | undefined;

  if (readOnly) {
    return <NationalIdentityNumber statePath={`${statePath}.identitetsnummer`} required={required} readOnly />;
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
        <NationalIdentityNumber statePath={`${statePath}.identitetsnummer`} required={required} />
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
