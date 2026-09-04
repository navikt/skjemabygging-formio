import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useStateField } from '../../context/state/useStateField';
import DatePicker from '../date/DatePicker';
import FormElementBox from '../shared/FormElementBox';
import { BaseFieldProps } from '../types';

type AddressValidityProps = Pick<BaseFieldProps, 'statePath' | 'required' | 'readOnly' | 'readMore' | 'fieldSize'>;

const AddressValidity = ({ statePath, required, readOnly, readMore, fieldSize }: AddressValidityProps) => {
  const { stateValue } = useStateField({ statePath });
  const address = (stateValue ?? {}) as { gyldigFraOgMed?: string };
  const minDate = dateUtils.addDays(-365);
  const maxDate = dateUtils.addDays(365);

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom="space-0">
      <DatePicker
        statePath={`${statePath}.gyldigFraOgMed`}
        label={TEXTS.statiske.address.validFrom}
        description={TEXTS.statiske.address.validFromDescription}
        required={required}
        readOnly={readOnly}
        fromDate={minDate}
        toDate={maxDate}
      />
      <DatePicker
        statePath={`${statePath}.gyldigTilOgMed`}
        label={TEXTS.statiske.address.validTo}
        description={TEXTS.statiske.address.validToDescription}
        readOnly={readOnly}
        fromDate={address.gyldigFraOgMed || minDate}
        toDate={maxDate}
        readMore={readMore}
      />
    </FormElementBox>
  );
};

export default AddressValidity;
export type { AddressValidityProps };
