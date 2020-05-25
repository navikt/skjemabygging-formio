import React from "react";
import { SkjemaGruppe, Input, Select } from "nav-frontend-skjema";
import "nav-frontend-skjema-style";

export const FormMetadataEditor = ({ title, name, display, type, path, saveForm }) => {
  return (
    <SkjemaGruppe>
      <Input
        label="Title"
        type="text"
        id="title"
        placeholder="Enter the form title"
        value={title || ""}
        readOnly={true}
      />
      <Input
        label="Name"
        type="text"
        id="name"
        placeholder="Enter the form machine name"
        value={name || ""}
        readOnly={true}
      />
      <Select
        label="Display as"
        name="form-display"
        id="form-display"
        value={display || ""}
        readOnly={true}
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
        readOnly={true}
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
        placeholder="example"
        style={{ textTransform: "lowercase", width: "120px" }}
        value={path || ""}
        readOnly={true}
      />
    </SkjemaGruppe>
  );
};
