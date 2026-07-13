import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useStateField } from '../../context/state/useStateField';
import DatePicker from '../date/DatePicker';
import { BaseFieldProps } from '../types';

type AddressValidityProps = Pick<BaseFieldProps, 'statePath' | 'required' | 'readOnly' | 'readMore'>;

const AddressValidity = ({ statePath, required, readOnly, readMore }: AddressValidityProps) => {
  const { stateValue } = useStateField({ statePath });
  const address = (stateValue ?? {}) as { gyldigFraOgMed?: string };
  const minDate = dateUtils.addDays(-365);
  const maxDate = dateUtils.addDays(365);

  return (
    <>
      <DatePicker
        statePath={`${statePath}.gyldigFraOgMed`}
        label={TEXTS.statiske.address.validFrom}
        required={required}
        readOnly={readOnly}
        fromDate={minDate}
        toDate={maxDate}
      />
      <DatePicker
        statePath={`${statePath}.gyldigTilOgMed`}
        label={TEXTS.statiske.address.validTo}
        readOnly={readOnly}
        fromDate={address.gyldigFraOgMed || minDate}
        toDate={maxDate}
        readMore={readMore}
      />
    </>
  );
};

export default AddressValidity;
export type { AddressValidityProps };
