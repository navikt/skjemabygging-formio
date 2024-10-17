import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useAddress } from '../addressContext';
import AddressDatePicker from './AddressDatePicker';

const ValidToDate = () => {
  const { address } = useAddress();

  return (
    <AddressDatePicker
      type="gyldigTilOgMed"
      label={TEXTS.statiske.address.validTo}
      description={TEXTS.statiske.address.validToDescription}
      value={address?.gyldigTilOgMed}
      fromDate={address?.gyldigFraOgMed || dateUtils.addDays(-365)}
      toDate={dateUtils.addDays(365)}
    ></AddressDatePicker>
  );
};

export default ValidToDate;
