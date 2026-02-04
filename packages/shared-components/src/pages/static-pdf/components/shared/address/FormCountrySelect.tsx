import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useForm } from '../../../../../context/form/FormContext';
import formComponentUtils from '../../../../../form-components/utils/formComponent';
import { getCountries, getCountryObject } from '../../../../../util/countries/countries';
import FormSelect from '../FormSelect';

interface Props {
  submissionPath: string;
}

const FormCountrySelect = ({ submissionPath }: Props) => {
  const countries = useMemo(() => getCountries(), []);
  const { updateSubmission, submission } = useForm();

  const handleChange = (countryCode: string) => {
    const country = getCountryObject(countryCode);
    updateSubmission(submissionPath, country);
  };

  const getDefaultValue = () => {
    const country = formComponentUtils.getSubmissionValue(submissionPath, submission);
    return country?.value;
  };

  return (
    <FormSelect
      submissionPath={submissionPath}
      label={TEXTS.statiske.address.country}
      values={countries}
      selectText={TEXTS.statiske.address.selectCountry}
      onChange={handleChange}
      defaultValue={getDefaultValue()}
      autoComplete="country"
    />
  );
};

export default FormCountrySelect;
