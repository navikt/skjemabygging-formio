import { Box, Checkbox, type ComboboxProps, Skeleton, Textarea, UNSAFE_Combobox } from '@navikt/ds-react';
import { Enhetstype, EnhetstypeNorg, supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';

type ComboboxOption = Exclude<NonNullable<ComboboxProps['options']>[number], string>;

interface EnhetSettingsProps {
  enhetstyperNorg: EnhetstypeNorg[] | undefined;
  enhetMaVelges: boolean;
  selectedEnhetstyper?: Enhetstype[];
  navUnitDescription?: string;
  error?: string;
  onChangeEnhetMaVelges: (value: boolean) => void;
  onChangeEnhetstyper: (enhetstyper: Enhetstype[]) => void;
  onChangeNavUnitDescription: (description: string) => void;
  readOnly?: boolean;
}

const EnhetSettings = ({
  enhetstyperNorg,
  enhetMaVelges,
  selectedEnhetstyper,
  navUnitDescription,
  error,
  onChangeEnhetMaVelges,
  onChangeEnhetstyper,
  onChangeNavUnitDescription,
  readOnly,
}: EnhetSettingsProps) => {
  const [options, setOptions] = useState<ComboboxOption[] | undefined>(undefined);

  useEffect(() => {
    if (enhetstyperNorg && !options) {
      const opts = enhetstyperNorg.map((type) => ({
        value: type.kodenavn,
        label: `${type.term} (${type.kodenavn})`,
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOptions(opts);
    }
  }, [enhetstyperNorg, options]);

  const renderCombobox = useCallback(() => {
    if (!options || !selectedEnhetstyper) {
      return <Skeleton />;
    }
    return (
      <Box paddingBlock="space-8">
        <UNSAFE_Combobox
          label="Velg hvilke enhetstyper det skal være mulig å sende inn til"
          options={options}
          selectedOptions={selectedEnhetstyper}
          isMultiSelect
          onToggleSelected={(value: string, isSelected: boolean) => {
            const updatedSelectedEnhetstyper = isSelected
              ? [...selectedEnhetstyper, value as Enhetstype]
              : selectedEnhetstyper.filter((selected) => selected !== value);
            onChangeEnhetstyper(updatedSelectedEnhetstyper);
          }}
          readOnly={readOnly}
        />
      </Box>
    );
  }, [options, selectedEnhetstyper, onChangeEnhetstyper, readOnly]);

  useEffect(() => {
    if (enhetMaVelges && selectedEnhetstyper === undefined) {
      onChangeEnhetstyper(supportedEnhetstyper);
    }
  }, [onChangeEnhetstyper, enhetMaVelges, selectedEnhetstyper]);

  return (
    <>
      <Checkbox
        checked={enhetMaVelges}
        onChange={(event) => onChangeEnhetMaVelges(event.target.checked)}
        readOnly={readOnly}
      >
        {'Bruker må velge enhet ved innsending på papir'}
      </Checkbox>
      {enhetMaVelges && (
        <>
          {renderCombobox()}
          <Box paddingBlock="space-8">
            <Textarea
              label="Instruksjoner for valg av enhet"
              description="Vises på nedlastingssiden ved valg av enhet"
              value={navUnitDescription || ''}
              onChange={(e) => onChangeNavUnitDescription(e.target.value)}
              readOnly={readOnly}
              maxLength={250}
              error={error}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default EnhetSettings;
