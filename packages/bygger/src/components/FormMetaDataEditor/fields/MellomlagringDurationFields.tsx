import { TextField } from '@navikt/ds-react';
import { NavFormSettingsDiff, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import LabelWithDiff from '../LabelWithDiff';
import { FormMetadataError, UpdateFormFunction } from '../utils/utils';

export interface BasicFieldsProps {
  onChange: UpdateFormFunction;
  diff: NavFormSettingsDiff;
  form: NavFormType;
  errors?: FormMetadataError;
}

const MellomlagrinDurationFields = ({ onChange, diff, form, errors }: BasicFieldsProps) => {
  const mellomlagringDurationDays = form.properties.mellomlagringDurationDays;

  return (
    <>
      <TextField
        className="mb"
        label={<LabelWithDiff label="Mellomlagringstid (dager)" diff={!!diff.mellomlagringDurationDays} />}
        type="number"
        id="mellomlagringDurationDays"
        value={mellomlagringDurationDays || ''}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, mellomlagringDurationDays: event.target.value },
          })
        }
        error={errors?.mellomlagringDurationDays}
      />
    </>
  );
};

export default MellomlagrinDurationFields;
