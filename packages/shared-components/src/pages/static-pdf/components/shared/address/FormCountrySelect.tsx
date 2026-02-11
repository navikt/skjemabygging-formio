import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useForm } from '../../../../../context/form/FormContext';
import { getCountries, getCountryObject } from '../../../../../util/countries/countries';
import FormSelect from '../form/FormSelect';

interface Props {
  submissionPath: string;
}

const FormCountrySelect = ({ submissionPath }: Props) => {
  const countries = useMemo(() => getCountries(), []);
  const { updateSubmission } = useForm();

  const handleChange = (countryCode: string) => {
    const country = getCountryObject(countryCode);
    updateSubmission(submissionPath, country);
  };

  return (
    <FormSelect
      submissionPath={submissionPath}
      label={TEXTS.statiske.address.country}
      values={countries}
      selectText={TEXTS.statiske.address.selectCountry}
      onChange={handleChange}
      autoComplete="country"
    />
  );
};

export default FormCountrySelect;
