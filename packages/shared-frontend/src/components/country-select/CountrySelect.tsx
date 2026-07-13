import { UNSAFE_Combobox as Combobox } from '@navikt/ds-react';
import { ComponentValue, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { getCountries } from '../../utils/countries';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
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
  const { currentLanguage, translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = stateValue as ComponentValue | undefined;
  const options = useMemo(
    () => getCountries(currentLanguage).filter((option) => !ignoreOptions?.includes(option.value)),
    [currentLanguage, ignoreOptions],
  );
  const selectedOption = options.find((option) => option.value === current?.value);

  const handleToggleSelected = (value: string, selected: boolean) => {
    setStateValue(selected ? options.find((option) => option.value === value) : undefined);
  };

  return (
    <FormElementBox marginBottom={marginBottom}>
      <Combobox
        id={inputId(statePath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        options={options}
        selectedOptions={selectedOption ? [selectedOption] : []}
        onToggleSelected={handleToggleSelected}
        error={error}
        readOnly={readOnly}
        isMultiSelect={false}
        shouldAutocomplete
        placeholder={translate(selectText)}
      />
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default CountrySelect;
export type { CountrySelectProps };
