import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
import { useAuth } from '../../../context/auth-context';

interface Props {
  name: string;
  label: any;
  value: SubmissionType[];
  error?: any;
  onChange: (value: any[]) => void;
  readonly?: boolean;
  excludeDigitalNoLogin?: boolean;
}

export const SubmissionTypeCheckbox = ({
  name,
  label,
  value,
  onChange,
  error,
  readonly,
  excludeDigitalNoLogin,
}: Props) => {
  const { userData } = useAuth();

  // TODO: Remove userData.isAdmin when digital no login is released
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
      {!excludeDigitalNoLogin && userData?.isAdmin && <Checkbox value="DIGITAL_NO_LOGIN">Uinnlogget digital</Checkbox>}
    </CheckboxGroup>
  );
};
