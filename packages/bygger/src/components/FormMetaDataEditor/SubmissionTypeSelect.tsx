import { Select } from "@navikt/ds-react";
import React from "react";

interface Props {
  name: string;
  label: React.ReactElement;
  value: string | undefined;
  allowEmpty?: boolean;
  error?: React.ReactNode;
  onChange: (event: any) => void;
}

const SubmissionTypeSelect = ({ name, label, value, allowEmpty, onChange, error }: Props) => {
  console.log({ name, label, value, allowEmpty });
  return (
    <Select className="mb-double" label={label} name={name} id={name} value={value} onChange={onChange} error={error}>
      {allowEmpty && <option>Velg innsendingstype</option>}
      <option value="PAPIR_OG_DIGITAL">Papir og digital</option>
      <option value="KUN_PAPIR">Kun papir</option>
      <option value="KUN_DIGITAL">Kun digital</option>
      <option value="INGEN">Ingen</option>
    </Select>
  );
};

export default SubmissionTypeSelect;
