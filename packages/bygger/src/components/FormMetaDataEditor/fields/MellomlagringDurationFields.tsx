import { TextField } from '@navikt/ds-react';
import { NavFormSettingsDiff, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import LabelWithDiff from '../LabelWithDiff';
import { FormMetadataError, UpdateFormFunction } from '../utils/utils';

export interface MellomlagringDurationProps {
  onChange: UpdateFormFunction;
  diff: NavFormSettingsDiff;
  form: NavFormType;
  errors?: FormMetadataError;
}

const MellomlagrinDurationFields = ({ onChange, diff, form, errors }: MellomlagringDurationProps) => {
  const mellomlagringDurationDays = form.properties.mellomlagringDurationDays;

  return (
    <>
      <TextField
        onWheel={(e) => e.currentTarget.blur()} // disable scroll wheel on number input
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
