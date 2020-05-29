import React from "react";
import { SkjemaGruppe, Input, Select } from "nav-frontend-skjema";
import "nav-frontend-skjema-style";

export const CopyOfFormMetadataEditor = ({ form, onChange }) => {
  const { title, path, display, name} = form;
  return (
    <SkjemaGruppe>
      <Input
        label="Tittel"
        type="text"
        id="title"
        placeholder="Skriv inn tittelen"
        value={title}
        onChange={event => onChange({ ...form, title: event.target.value })}
      />
      <Input
        label="Navn"
        type="text"
        id="name"
        placeholder="Skriv inn teknisk navn"
        value={name}
        onChange={event => onChange({ ...form, name: event.target.value })}
      />
      <Select
        label="Vis som"
        name="form-display"
        id="form-display"
        value={display}
        onChange={event => onChange({ ...form, display: event.target.value })}
      >
        <option label="Form" value="form">
          Form
        </option>
        <option label="Wizard" value="wizard">
          Wizard
        </option>
      </Select>
      <Input
        label="Path"
        type="text"
        id="path"
        style={{ textTransform: "lowercase", width: "120px" }}
        value={path}
        onChange={event => onChange({ ...form, path: event.target.value })}
      />
    </SkjemaGruppe>
  );
};
