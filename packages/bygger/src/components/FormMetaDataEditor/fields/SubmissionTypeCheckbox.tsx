import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  name: string;
  label: any;
  value: SubmissionType[];
  error?: any;
  onChange: (event: any) => void;
  readonly?: boolean;
}

export const SubmissionTypeCheckbox = ({ name, label, value, onChange, error, readonly }: Props) => {
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
      <Checkbox value="PAPER">Papir</Checkbox>
      <Checkbox value="DIGITAL">Digital</Checkbox>
    </CheckboxGroup>
  );
};
