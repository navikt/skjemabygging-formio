import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { InnsendingType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';

interface Props {
  name: string;
  label: any;
  value: InnsendingType[];
  error?: any;
  onChange: (event: any) => void;
  excluded?: InnsendingType[];
  readonly?: boolean;
}

export const SubmissionTypeCheckbox = ({ name, label, value, onChange, error, excluded, readonly }: Props) => {
  const include = useCallback((type: InnsendingType) => !excluded?.includes(type), [excluded]);

  return (
    <CheckboxGroup
      className="mb"
      legend={label}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      error={error}
      readOnly={readonly}
    >
      {include('PAPIR_OG_DIGITAL') && <Checkbox value="PAPIR_OG_DIGITAL">Papir og digital</Checkbox>}
      {include('KUN_PAPIR') && <Checkbox value="KUN_PAPIR">Kun papir</Checkbox>}
      {include('KUN_DIGITAL') && <Checkbox value="KUN_DIGITAL">Kun digital</Checkbox>}
      {include('INGEN') && <Checkbox value="INGEN">Ingen</Checkbox>}
    </CheckboxGroup>
  );
};
