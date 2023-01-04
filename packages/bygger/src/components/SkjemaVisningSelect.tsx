import { Select } from "@navikt/ds-react";
import { DisplayType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import React from "react";
import { UpdateFormFunction } from "./FormMetaDataEditor/FormMetadataEditor";

interface Props {
  form: NavFormType;
  onChange: UpdateFormFunction;
}

const SkjemaVisningSelect = ({ form, onChange }: Props) => {
  const { display } = form;
  return (
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
  );
};

export default SkjemaVisningSelect;
