import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import {
  DisplayType,
  InnsendingType,
  MottaksadresseData,
  NavFormType,
  signatureUtils,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import { AlertStripeFeil } from "nav-frontend-alertstriper";
import { Knapp } from "nav-frontend-knapper";
import { Checkbox, Input, Select, SkjemaGruppe, Textarea } from "nav-frontend-skjema";
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
  errors?: FormMetadataError;
}

type BasicFormProps = Props & { usageContext: UsageContext };
type FormMetadataError = { [key: string]: string };

const validateFormMetadata = (form: NavFormType) => {
  const errors = {} as FormMetadataError;
  if (!form.title) {
    errors.title = "Du må oppgi skjematittel";
  }
  if (!form.properties.skjemanummer) {
    errors.skjemanummer = "Du må oppgi skjemanummer";
  }
  if (!form.properties.tema) {
    errors.tema = "Du må oppgi temakode";
  }
  return errors;
};

const isFormMetadataValid = (errors) => Object.keys(errors).length === 0;

export const COMPONENT_TEXTS = {
  BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR: "Bruker må velge enhet ved innsending på papir",
};

const BasicFormMetadataEditor = ({ form, onChange, usageContext, errors }: BasicFormProps) => {
  const { featureToggles } = useAppConfig();
  const { mottaksadresser, ready, errorMessage: mottaksadresseError } = useMottaksadresser();
  const {
    title,
    properties: {
      isTestForm,
      skjemanummer,
      tema,
      downloadPdfButtonText,
      innsending: innsendingFraProps,
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
      const updatedSignatures = mappedSignatures.filter((s) => s.key !== signatureKey);

      onChange({
        ...form,
        properties: {
          ...form.properties,
          signatures: updatedSignatures,
        },
      });
    }
  };

  const innsending = innsendingFraProps || "PAPIR_OG_DIGITAL";

  const toAddressString = (address: MottaksadresseData) => {
    const linjer = [address.adresselinje1];
    if (address.adresselinje2) {
      linjer.push(address.adresselinje2);
    }
    if (address.adresselinje3) {
      linjer.push(address.adresselinje3);
    }
    return `${linjer.join(", ")}, ${address.postnummer} ${address.poststed}`;
  };

  return (
    <SkjemaGruppe>
      <Checkbox
        label="Dette er et testskjema"
        id="teststatus"
        checked={!!isTestForm}
        onChange={(event) =>
          onChange({ ...form, properties: { ...form.properties, isTestForm: event.target.checked } })
        }
      />
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
        feil={errors?.skjemanummer}
      />
      <Input
        label="Tittel"
        type="text"
        id="title"
        placeholder="Skriv inn tittel"
        value={title}
        onChange={(event) => onChange({ ...form, title: event.target.value })}
        feil={errors?.title}
      />
      <Input
        label="Temakode"
        type="text"
        id="tema"
        placeholder="Skriv inn temakode (f.eks. OPP)"
        value={tema}
        onChange={(event) => onChange({ ...form, properties: { ...form.properties, tema: event.target.value } })}
        feil={errors?.tema}
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
              <option value={adresse._id} key={adresse._id}>
                {toAddressString(adresse.data)}
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

export const CreationFormMetadataEditor = ({ form, onChange, errors }: Props) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext="create" errors={errors} />
);

export const FormMetadataEditor = ({ form, onChange, errors }: Props) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext="edit" errors={errors} />
);

export { validateFormMetadata, isFormMetadataValid };
