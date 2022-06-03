import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import {
  DisplayType,
  InnsendingType,
  NavFormType,
  signatureUtils,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import { AlertStripeFeil } from "nav-frontend-alertstriper";
import { Knapp } from "nav-frontend-knapper";
import { Input, Select, SkjemaGruppe, Textarea } from "nav-frontend-skjema";
import React from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import useMottaksadresser from "../hooks/useMottaksadresser";
import EnhetSettings from "./EnhetSettings";
import SignatureComponent from "./layout/SignatureComponent";

export type UpdateFormFunction = (form: NavFormType) => void;
export type UsageContext = "create" | "edit";

interface Props {
  form: NavFormType;
  onChange: UpdateFormFunction;
}

type BasicFormProps = Props & { usageContext: UsageContext };

export const COMPONENT_TEXTS = {
  BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR: "Bruker må velge enhet ved innsending på papir",
};

const BasicFormMetadataEditor = ({ form, onChange, usageContext }: BasicFormProps) => {
  const { featureToggles } = useAppConfig();
  const { mottaksadresser, ready, errorMessage: mottaksadresseError } = useMottaksadresser();

  const {
    title,
    path,
    display,
    name,
    type,
    properties: {
      skjemanummer,
      tema,
      downloadPdfButtonText,
      innsending: innsendingFraProps,
      hasPapirInnsendingOnly,
      mottaksadresseId,
      enhetMaVelgesVedPapirInnsending,
      enhetstyper,
      descriptionOfSignatures,
      signatures,
    },
  } = form;

  const addNewSignature = () =>
    onChange({
      ...form,
      properties: {
        ...form.properties,
        signatures: [
          ...signatureUtils.mapBackwardCompatibleSignatures(signatures),
          {
            label: "",
            description: "",
            key: uuidv4(),
          },
        ],
      },
    });

  const addExistingSignature = (newSignature, index) =>
    onChange({
      ...form,
      properties: {
        ...form.properties,
        signatures: signatureUtils.mapBackwardCompatibleSignatures(signatures).map((signatureObject, i) => {
          if (index === i) {
            return newSignature;
          } else {
            return signatureObject;
          }
        }),
      },
    });

  const removeSignature = (signatureKey) => {
    const mappedSignatures = signatureUtils.mapBackwardCompatibleSignatures(signatures);
    if (mappedSignatures.length > 0) {
      mappedSignatures.splice(
        mappedSignatures.findIndex((s) => s.key === signatureKey),
        1
      );

      onChange({
        ...form,
        properties: {
          ...form.properties,
          signatures: mappedSignatures,
        },
      });
    }
  };

  const innsending = innsendingFraProps || (hasPapirInnsendingOnly ? "KUN_PAPIR" : "PAPIR_OG_DIGITAL");
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
        onChange={(event) => onChange({ ...form, display: event.target.value as DisplayType })}
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
      <Input
        label="Tekst på knapp for nedlasting av pdf"
        type="text"
        id="downloadPdfButtonText"
        value={downloadPdfButtonText || ""}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, downloadPdfButtonText: event.target.value },
          })
        }
        placeholder={TEXTS.grensesnitt.downloadApplication}
      />
      <Select
        label="Innsending"
        name="form-innsending"
        id="form-innsending"
        value={innsending}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, innsending: event.target.value as InnsendingType },
          })
        }
      >
        <option value="PAPIR_OG_DIGITAL">Papir og digital</option>
        <option value="KUN_PAPIR">Kun papir</option>
        <option value="KUN_DIGITAL">Kun digital</option>
        <option value="INGEN">Ingen</option>
      </Select>
      {innsending === "INGEN" && (
        <>
          <Input
            label="Overskrift til innsending"
            value={form.properties.innsendingOverskrift || ""}
            onChange={(event) =>
              onChange({
                ...form,
                properties: { ...form.properties, innsendingOverskrift: event.target.value },
              })
            }
          />
          <Textarea
            label="Forklaring til innsending"
            value={form.properties.innsendingForklaring || ""}
            onChange={(event) =>
              onChange({
                ...form,
                properties: { ...form.properties, innsendingForklaring: event.target.value },
              })
            }
          />
        </>
      )}
      {(innsending === "KUN_PAPIR" || innsending === "PAPIR_OG_DIGITAL") && (
        <div className="margin-bottom-default">
          <Select
            label="Mottaksadresse"
            name="form-mottaksadresse"
            id="form-mottaksadresse"
            value={mottaksadresseId}
            disabled={!ready}
            onChange={(event) =>
              onChange({
                ...form,
                properties: {
                  ...form.properties,
                  mottaksadresseId: event.target.value || undefined,
                  enhetMaVelgesVedPapirInnsending: false,
                },
              })
            }
          >
            <option value="">
              {mottaksadresseId && !ready ? `Mottaksadresse-id: ${mottaksadresseId}` : "Standard"}
            </option>
            {mottaksadresser.map((adresse) => (
              <option value={adresse.id} key={adresse.id}>
                {adresse.toString()}
              </option>
            ))}
          </Select>
          {mottaksadresseError && <AlertStripeFeil>{mottaksadresseError}</AlertStripeFeil>}
        </div>
      )}
      <div className="margin-bottom-default">
        <Link to="/mottaksadresser">Rediger mottaksadresser</Link>
      </div>
      {(innsending === "KUN_PAPIR" || innsending === "PAPIR_OG_DIGITAL") &&
        !mottaksadresseId &&
        featureToggles?.enableEnhetsListe && (
          <EnhetSettings
            enhetMaVelges={!!enhetMaVelgesVedPapirInnsending}
            selectedEnhetstyper={enhetstyper}
            onChangeEnhetMaVelges={(selected) =>
              onChange({
                ...form,
                properties: {
                  ...form.properties,
                  enhetMaVelgesVedPapirInnsending: selected,
                  enhetstyper: selected ? form.properties.enhetstyper : undefined,
                },
              })
            }
            onChangeEnhetstyper={(enhetstyper) =>
              onChange({ ...form, properties: { ...form.properties, enhetstyper } })
            }
          />
        )}

      <Textarea
        label="Generelle instruksjoner (valgfritt)"
        value={descriptionOfSignatures || ""}
        maxLength={0}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, descriptionOfSignatures: event.target.value },
          })
        }
      />

      {signatureUtils.mapBackwardCompatibleSignatures(signatures)?.map((signature, index) => (
        <div key={signature.key}>
          <SignatureComponent
            signature={signature}
            index={index}
            onChange={(newSignature) => addExistingSignature(newSignature, index)}
            onDelete={() => removeSignature(signature.key)}
          />
        </div>
      ))}

      <Knapp onClick={addNewSignature}>Legg til signatur</Knapp>
    </SkjemaGruppe>
  );
};

export const SkjemaVisningSelect = ({ form, onChange }: Props) => {
  const { display } = form;
  return (
    <Select
      label="Vis som"
      name="form-display"
      id="form-display"
      value={display}
      onChange={(event) => onChange({ ...form, display: event.target.value as DisplayType })}
      bredde="s"
    >
      <option value="form">Skjema</option>
      <option value="wizard">Veiviser</option>
    </Select>
  );
};

export const CreationFormMetadataEditor = ({ form, onChange }: Props) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext="create" />
);

export const FormMetadataEditor = ({ form, onChange }: Props) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext="edit" />
);
