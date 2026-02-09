import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { getCountries } from '../../../../util/countries/countries';
import FormSelect from './FormSelect';

interface Props {
  submissionPath: string;
}

const FormCountrySelect = ({ submissionPath }: Props) => {
  const countries = useMemo(() => getCountries(), []);

  return (
    <FormSelect
      submissionPath={submissionPath}
      label={TEXTS.statiske.address.country}
      values={countries}
      selectText={TEXTS.statiske.address.selectCountry}
    />
  );
};

export default FormCountrySelect;
