import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { getCountries } from '../../utils/countries';
import Select from '../select/Select';
import { BaseFieldProps } from '../types';

interface CountrySelectProps extends BaseFieldProps {
  label?: string;
  ignoreOptions?: string[];
  selectText?: string;
}

const CountrySelect = ({
  statePath,
  label = TEXTS.statiske.address.country,
  description,
  selectText = TEXTS.statiske.address.selectCountry,
  ignoreOptions,
  required = true,
  readOnly,
  readMore,
  marginBottom,
}: CountrySelectProps) => {
  const { currentLanguage } = useLanguage();
  const options = useMemo(
    () => getCountries(currentLanguage).filter((option) => !ignoreOptions?.includes(option.value)),
    [currentLanguage, ignoreOptions],
  );

  return (
    <Select
      statePath={statePath}
      label={label}
      description={description}
      values={options}
      selectText={selectText}
      required={required}
      readOnly={readOnly}
      readMore={readMore}
      marginBottom={marginBottom}
      valueType="option"
    />
  );
};

export default CountrySelect;
export type { CountrySelectProps };
