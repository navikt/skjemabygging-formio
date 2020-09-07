import React from "react";
import {SkjemaGruppe, Input, Select} from "nav-frontend-skjema";
import "nav-frontend-skjema-style";

const BasicFormMetadataEditor = ({form, onChange, usageContext}) => {
  const {title, path, display, name} = form;
  return (
    <SkjemaGruppe>
      <Input
        label="Skjemanummer"
        type="text"
        id="title"
        placeholder="Skriv inn skjemanummer"
        value={title}
        readOnly={usageContext === 'edit'}
        onChange={event => onChange({...form, title: event.target.value})}
      />
      <Input
        label="Navn"
        type="text"
        id="name"
        placeholder="Skriv inn teknisk navn"
        value={name}
        readOnly={usageContext === 'edit'}
        onChange={event => onChange({...form, name: event.target.value})}
      />
      <Select
        label="Vis som"
        name="form-display"
        id="form-display"
        value={display}
        onChange={event => onChange({...form, display: event.target.value})}
      >
        <option label="Skjema" value="form">
          Skjema
        </option>
        <option label="Veiviser" value="wizard">
          Veiviser
        </option>
      </Select>
      <Input
        label="Path"
        type="text"
        id="path"
        style={{textTransform: "lowercase", width: "120px"}}
        value={path}
        readOnly={usageContext === 'edit'}
        onChange={event => onChange({...form, path: event.target.value})}
      />
    </SkjemaGruppe>
  );
}

export const SkjemaVisningSelect = ({form, onChange}) => {
  const {display} = form;
  return (
    <Select
      label="Vis som"
      name="form-display"
      id="form-display"
      value={display}
      onChange={event => onChange({...form, display: event.target.value})}
      bredde="s"
    >
      <option label="Skjema" value="form">
        Skjema
      </option>
      <option label="Veiviser" value="wizard">
        Veiviser
      </option>
    </Select>
  );
}
export const CreationFormMetadataEditor = ({form, onChange}) =>
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext={'create'}/>;

export const FormMetadataEditor = ({form, onChange}) =>
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext={'edit'}/>;

