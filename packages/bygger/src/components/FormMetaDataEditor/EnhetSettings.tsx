import { Box, Checkbox, Skeleton, UNSAFE_Combobox } from '@navikt/ds-react';
import { ComboboxOption } from '@navikt/ds-react/esm/form/combobox/types';
import { Enhetstype, EnhetstypeNorg, supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo } from 'react';

interface EnhetSettingsProps {
  enhetstyperNorg: EnhetstypeNorg[] | undefined;
  enhetMaVelges: boolean;
  selectedEnhetstyper?: Enhetstype[];
  onChangeEnhetMaVelges: (value: boolean) => void;
  onChangeEnhetstyper: (enhetstyper: Enhetstype[]) => void;
  readOnly?: boolean;
}

const EnhetSettings = ({
  enhetstyperNorg,
  enhetMaVelges,
  selectedEnhetstyper,
  onChangeEnhetMaVelges,
  onChangeEnhetstyper,
  readOnly,
}: EnhetSettingsProps) => {
  const options = useMemo<ComboboxOption[] | undefined>(() => {
    return enhetstyperNorg?.map((type) => ({
      value: type.kodenavn,
      label: `${type.term} (${type.kodenavn})`,
    }));
  }, [enhetstyperNorg]);

  const renderCombobox = useCallback(() => {
    if (!options || !selectedEnhetstyper) {
      return <Skeleton />;
    }
    return (
      <Box>
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
      {enhetMaVelges && renderCombobox()}
    </>
  );
};

export default EnhetSettings;
