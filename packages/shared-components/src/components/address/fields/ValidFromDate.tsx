import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressDatePicker from './AddressDatePicker';

const ValidFromDate = () => {
  const { address, required } = useAddress();

  return (
    <AddressDatePicker
      type="gyldigFraOgMed"
      label={TEXTS.statiske.address.validFrom}
      description={TEXTS.statiske.address.validFromDescription}
      value={address?.gyldigFraOgMed}
      required={required}
      fromDate={dateUtils.addDays(-365)}
      toDate={dateUtils.addDays(365)}
    ></AddressDatePicker>
  );
};

export default ValidFromDate;
