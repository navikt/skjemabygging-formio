import React from "react";
import { SkjemaGruppe, Input, Select } from "nav-frontend-skjema";
import "nav-frontend-skjema-style";
import styled from "@material-ui/styles/styled";

const BasicFormMetadataEditor = ({ form, onChange, usageContext }) => {
  const {
    title,
    path,
    display,
    name,
    tags,
    properties: { skjemanummer, tema },
  } = form;
  console.log(tags);
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
      <KodeverkRef>
        Her finner du oversikt over temakoder:{" "}
        <a href="https://kodeverk-web.nais.adeo.no/kodeverksoversikt/kodeverk/Vedleggskoder">
          https://kodeverk-web.nais.adeo.no/kodeverksoversikt/kodeverk/Vedleggskoder
        </a>{" "}
        (må åpnes i Chrome SKSS)
      </KodeverkRef>
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
        style={{ textTransform: "lowercase", width: "120px" }}
        value={path}
        readOnly={usageContext === "edit"}
        onChange={(event) => onChange({ ...form, path: event.target.value })}
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
      <option label="Skjema" value="form">
        Skjema
      </option>
      <option label="Veiviser" value="wizard">
        Veiviser
      </option>
    </Select>
  );
};
export const CreationFormMetadataEditor = ({ form, onChange }) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext={"create"} />
);

export const FormMetadataEditor = ({ form, onChange }) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext={"edit"} />
);

const KodeverkRef = styled("div")({
  marginBottom: "1rem",
});
