import { Select } from '@navikt/ds-react';
import { InnsendingType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';

interface Props {
  name: string;
  label: any;
  value: string | undefined;
  error?: any;
  onChange: (event: any) => void;
  excluded?: InnsendingType[];
  showDefaultOption?: boolean;
}

const SubmissionTypeSelect = ({ name, label, value, onChange, error, excluded, showDefaultOption = true }: Props) => {
  const include = useCallback((type: InnsendingType) => !excluded?.includes(type), [excluded]);
  return (
    <Select className="mb" label={label} name={name} id={name} value={value} onChange={onChange} error={error}>
      {showDefaultOption && <option value="">Velg innsendingstype</option>}
      {include('PAPIR_OG_DIGITAL') && <option value="PAPIR_OG_DIGITAL">Papir og digital</option>}
      {include('KUN_PAPIR') && <option value="KUN_PAPIR">Kun papir</option>}
      {include('KUN_DIGITAL') && <option value="KUN_DIGITAL">Kun digital</option>}
      {include('INGEN') && <option value="INGEN">Ingen</option>}
    </Select>
  );
};

export default SubmissionTypeSelect;
