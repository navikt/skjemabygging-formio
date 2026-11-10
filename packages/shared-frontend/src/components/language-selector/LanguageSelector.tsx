import { Select } from '@navikt/ds-react';

interface LanguageOption {
  value: string;
  label: string;
  language?: string;
}

interface LanguageSelectorProps {
  ariaLabel: string;
  currentLanguage: string;
  options: LanguageOption[];
  onChange: (language: string) => void;
}

const LanguageSelector = ({ ariaLabel, currentLanguage, options, onChange }: LanguageSelectorProps) => {
  if (options.length < 2) {
    return null;
  }

  return (
    <Select
      label={ariaLabel}
      hideLabel
      value={currentLanguage}
      onChange={(event) => onChange(event.currentTarget.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} lang={option.language}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

export default LanguageSelector;
export type { LanguageOption, LanguageSelectorProps };
