import { Alert, Select } from '@navikt/ds-react';
import { NavFormSettingsDiff, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import useTemaKoder from '../../../api/useTemaKoder';
import LabelWithDiff from '../LabelWithDiff';
import { FormMetadataError, UpdateFormFunction } from '../utils/utils';

export interface TemaKodeFieldsProps {
  onChange: UpdateFormFunction;
  diff: NavFormSettingsDiff;
  form: NavFormType;
  errors?: FormMetadataError;
}

const TemaKodeFields = ({ onChange, diff, form, errors }: TemaKodeFieldsProps) => {
  const { temaKoder, ready: isTemaKoderReady, errorMessage: temaKoderError } = useTemaKoder();
  const tema = form.properties.tema;
  const isLockedForm = form.properties.isLockedForm;

  return (
    <>
      <Select
        className="mb-4"
        label={<LabelWithDiff label="Tema" diff={!!diff.tema} />}
        id="tema"
        disabled={!isTemaKoderReady}
        value={temaKoder?.find((temaKode) => temaKode.key === tema)?.key || ''}
        onChange={(event) => onChange({ ...form, properties: { ...form.properties, tema: event.target.value } })}
        error={errors?.tema}
        readOnly={isLockedForm}
      >
        <option value="">{'Velg tema'}</option>
        {temaKoder?.map(({ key, value }) => (
          <option key={key} value={key}>
            {`${value} (${key})`}
          </option>
        ))}
      </Select>
      {temaKoderError && (
        <Alert variant="error" size="small">
          {temaKoderError}
        </Alert>
      )}
    </>
  );
};

export default TemaKodeFields;
