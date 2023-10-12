import { Select } from '@navikt/ds-react';
import { DisplayType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from './FormMetaDataEditor/utils';

interface Props {
  form: NavFormType;
  onChange: UpdateFormFunction;
}

const SkjemaVisningSelect = ({ form, onChange }: Props) => {
  const { display } = form;
  return (
    <div>
      <Select
        label="Vis som"
        name="form-display"
        id="form-display"
        value={display}
        onChange={(event) => onChange({ ...form, display: event.target.value as DisplayType })}
        size="small"
      >
        <option value="form">Skjema</option>
        <option value="wizard">Veiviser</option>
      </Select>
    </div>
  );
};

export default SkjemaVisningSelect;
