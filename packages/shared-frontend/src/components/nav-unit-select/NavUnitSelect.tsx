import { Enhet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { UnvalidatedFields } from '../../context/validation/ValidationScopeContext';
import Select from '../select/Select';
import { BaseFieldProps } from '../types';
import { toNavUnitValidation } from './navUnitValidation';

interface Props extends BaseFieldProps {
  units: Pick<Enhet, 'enhetNr' | 'navn'>[];
  value?: string;
  onChange?: (value: string) => void;
  error?: ReactNode;
}

const NavUnitSelect = ({
  statePath,
  units,
  label = TEXTS.statiske.navUnit.choose,
  required = true,
  readOnly,
  readMore,
  description,
  value,
  onChange,
  error,
  fieldSize,
  marginBottom,
}: Props) => {
  const validation = toNavUnitValidation({ statePath, label, required });
  const binding = useFieldBinding({
    statePath,
    controlled: value !== undefined,
    validation: value !== undefined ? { ...validation, value } : validation,
  });
  return (
    <UnvalidatedFields>
      <Select
        statePath={statePath}
        label={label}
        required={required}
        readOnly={readOnly}
        readMore={readMore}
        description={description}
        values={units.map(({ enhetNr, navn }) => ({ value: enhetNr, label: navn }))}
        selectText={TEXTS.statiske.navUnit.selectDefault}
        value={value ?? (typeof binding.stateValue === 'string' ? binding.stateValue : '')}
        onChange={onChange ?? binding.setStateValue}
        error={error ?? binding.error}
        fieldSize={fieldSize}
        marginBottom={marginBottom}
      />
    </UnvalidatedFields>
  );
};

export default NavUnitSelect;
export type { Props as NavUnitSelectProps };
