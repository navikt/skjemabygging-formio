import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  name: string;
  label: any;
  value: SubmissionType[];
  error?: any;
  onChange: (value: any[]) => void;
  readonly?: boolean;
  excludeUADigital?: boolean;
}

export const SubmissionTypeCheckbox = ({ name, label, value, onChange, error, readonly, excludeUADigital }: Props) => {
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
      {!excludeUADigital && <Checkbox value="UADIGITAL">Uinnlogget digital</Checkbox>}
    </CheckboxGroup>
  );
};
