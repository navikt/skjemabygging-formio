import { Enhet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import Select from '../select/Select';
import { FormElementBoxProps } from '../shared/FormElementBox';

interface Props {
  statePath: string;
  units: Pick<Enhet, 'enhetNr' | 'navn'>[];
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: ReactNode;
  fieldSize?: FormElementBoxProps['fieldSize'];
  marginBottom?: FormElementBoxProps['marginBottom'];
}

const NavUnitSelect = ({ statePath, units, description, value, onChange, error, fieldSize, marginBottom }: Props) => (
  <Select
    statePath={statePath}
    label={TEXTS.statiske.navUnit.choose}
    description={description}
    values={units.map(({ enhetNr, navn }) => ({ value: enhetNr, label: navn }))}
    selectText={TEXTS.statiske.navUnit.selectDefault}
    value={value}
    onChange={onChange}
    error={error}
    fieldSize={fieldSize}
    marginBottom={marginBottom}
  />
);

export default NavUnitSelect;
export type { Props as NavUnitSelectProps };
