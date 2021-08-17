import React from "react";
import { SkjemaGruppe, Input, Select, Checkbox } from "nav-frontend-skjema";
import "nav-frontend-skjema-style";

const BasicFormMetadataEditor = ({ form, onChange, usageContext }) => {
  const {
    title,
    path,
    display,
    name,
    tags,
    type,
    properties: { skjemanummer, tema, hasPapirInnsendingOnly },
  } = form;
  return (
    <SkjemaGruppe>
      <Input
        label="Skjemanummer"
        type="text"
        id="skjemanummer"
        placeholder="Skriv inn skjemanummer"
        value={skjemanummer}
        readOnly={usageContext === "edit"}
        onChange={(event) =>
          onChange({ ...form, properties: { ...form.properties, skjemanummer: event.target.value } })
        }
      />
      <Input
        label="Tittel"
        type="text"
        id="title"
        placeholder="Skriv inn tittel"
        value={title}
        onChange={(event) => onChange({ ...form, title: event.target.value })}
      />
      <Input
        label="Temakode"
        type="text"
        id="tema"
        placeholder="Skriv inn temakode (f.eks. OPP)"
        value={tema}
        readOnly={usageContext === "edit"}
        onChange={(event) => onChange({ ...form, properties: { ...form.properties, tema: event.target.value } })}
      />
      <Select
        label="Type"
        name="form-type"
        id="form-type"
        value={type}
        onChange={(event) => onChange({ ...form, type: event.target.value })}
      >
        <option label="Form" value="form">
          Form
        </option>
        <option label="Resource" value="resource">
          Resource
        </option>
      </Select>
      <Select
        label="Vis som"
        name="form-display"
        id="form-display"
        value={display}
        onChange={(event) => onChange({ ...form, display: event.target.value })}
      >
        <option label="Skjema" value="form">
          Skjema
        </option>
        <option label="Veiviser" value="wizard">
          Veiviser
        </option>
      </Select>
      <Input
        label="Navn"
        type="text"
        id="name"
        value={name}
        readOnly={usageContext === "edit"}
        onChange={(event) => onChange({ ...form, name: event.target.value })}
      />

      <Input
        label="Path"
        type="text"
        id="path"
        style={{ textTransform: "lowercase" }}
        value={path}
        readOnly={usageContext === "edit"}
        onChange={(event) => onChange({ ...form, path: event.target.value })}
      />
      <Checkbox
        label="Tillat digital innsending"
        checked={!hasPapirInnsendingOnly}
        onChange={() =>
          onChange({ ...form, properties: { ...form.properties, hasPapirInnsendingOnly: !hasPapirInnsendingOnly } })
        }
      />
    </SkjemaGruppe>
  );
};

export const SkjemaVisningSelect = ({ form, onChange }) => {
  const { display } = form;
  return (
    <Select
      label="Vis som"
      name="form-display"
      id="form-display"
      value={display}
      onChange={(event) => onChange({ ...form, display: event.target.value })}
      bredde="s"
    >
      <option value="form">Skjema</option>
      <option value="wizard">Veiviser</option>
    </Select>
  );
};
export const CreationFormMetadataEditor = ({ form, onChange }) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext={"create"} />
);

export const FormMetadataEditor = ({ form, onChange }) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext={"edit"} />
);
