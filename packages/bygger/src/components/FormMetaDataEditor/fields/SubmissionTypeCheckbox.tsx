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
  hideTypes?: ('DIGITAL_NO_LOGIN' | 'STATIC_PDF' | 'PAPER_NO_COVER_PAGE')[];
}

export const SubmissionTypeCheckbox = ({ name, label, value, onChange, error, readonly, hideTypes }: Props) => {
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
      <Checkbox value="PAPER">Send i posten</Checkbox>
      <Checkbox value="DIGITAL">Digital</Checkbox>
      {!hideTypes?.includes('DIGITAL_NO_LOGIN') && (
        <Checkbox value="DIGITAL_NO_LOGIN" disabled={!userData?.isAdmin}>
          Uinnlogget digital
        </Checkbox>
      )}
      {!hideTypes?.includes('STATIC_PDF') && (
        <Checkbox value="STATIC_PDF" disabled={!userData?.isAdmin}>
          Statisk PDF
        </Checkbox>
      )}
      {!hideTypes?.includes('PAPER_NO_COVER_PAGE') && (
        <Checkbox value="PAPER_NO_COVER_PAGE">Ingen innsending til Nav / Vedleggsskjema</Checkbox>
      )}
    </CheckboxGroup>
  );
};
