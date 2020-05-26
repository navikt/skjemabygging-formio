import React from "react";
import { SkjemaGruppe, Input, Select } from "nav-frontend-skjema";
import "nav-frontend-skjema-style";

export const FormMetadataEditor = ({ form, onChange }) => {
  const {title, path, display, name, type} = form;
  return (
    <SkjemaGruppe>
      <Input
        label="Title"
        type="text"
        id="title"
        placeholder="Enter the form title"
        value={title || ""}
        onChange={(event) => onChange({...form, title: event.target.value})}
      />
      <Input
        label="Name"
        type="text"
        id="name"
        placeholder="Enter the form machine name"
        value={name || ""}
        onChange={(event) => onChange({...form, name: event.target.value})}
      />
      <Select
        label="Display as"
        name="form-display"
        id="form-display"
        value={display || ""}
        onChange={(event) => onChange({...form, display: event.target.value})}
      >
        <option label="Form" value="form">
          Form
        </option>
        <option label="Wizard" value="wizard">
          Wizard
        </option>
        <option label="PDF" value="pdf">
          PDF
        </option>
      </Select>
      <Select
        label="Type"
        name="form-type"
        id="form-type"
        value={type}
        onChange={(event) => onChange({...form, type: event.target.value})}
      >
        <option label="Form" value="form">
          Form
        </option>
        <option label="Resource" value="resource">
          Resource
        </option>
      </Select>
      <Input
        label="Path"
        type="text"
        id="path"
        style={{ textTransform: "lowercase", width: "120px" }}
        value={path || ""}
        readOnly={true}
      />
    </SkjemaGruppe>
  );
};
