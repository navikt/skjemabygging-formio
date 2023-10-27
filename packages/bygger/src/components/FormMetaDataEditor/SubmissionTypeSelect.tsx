import { Select } from '@navikt/ds-react';

interface Props {
  name: string;
  label: any;
  value: string | undefined;
  error?: any;
  onChange: (event: any) => void;
}

const SubmissionTypeSelect = ({ name, label, value, onChange, error }: Props) => {
  return (
    <Select className="mb" label={label} name={name} id={name} value={value} onChange={onChange} error={error}>
      <option value="">Velg innsendingstype</option>
      <option value="PAPIR_OG_DIGITAL">Papir og digital</option>
      <option value="KUN_PAPIR">Kun papir</option>
      <option value="KUN_DIGITAL">Kun digital</option>
      <option value="INGEN">Ingen</option>
    </Select>
  );
};

export default SubmissionTypeSelect;
