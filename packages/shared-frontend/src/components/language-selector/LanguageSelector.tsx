import { ActionMenu, Button } from '@navikt/ds-react';

interface LanguageOption {
  value: string;
  label: string;
  language?: string;
}

interface LanguageSelectorProps {
  ariaLabel: string;
  currentLanguage: string;
  label: string;
  options: LanguageOption[];
  onChange: (language: string) => void;
}

const LanguageSelector = ({ ariaLabel, currentLanguage, label, options, onChange }: LanguageSelectorProps) => {
  if (options.length < 2) {
    return null;
  }

  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button type="button" variant="tertiary" size="small">
          {label}
        </Button>
      </ActionMenu.Trigger>
      <ActionMenu.Content align="end">
        <ActionMenu.RadioGroup aria-label={ariaLabel} value={currentLanguage} onValueChange={onChange}>
          {options.map((option) => (
            <ActionMenu.RadioItem key={option.value} value={option.value} lang={option.language}>
              {option.label}
            </ActionMenu.RadioItem>
          ))}
        </ActionMenu.RadioGroup>
      </ActionMenu.Content>
    </ActionMenu>
  );
};

export default LanguageSelector;
export type { LanguageOption, LanguageSelectorProps };
