import { Alert, Button, Checkbox, Fieldset, Select, Textarea, TextField } from "@navikt/ds-react";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import {
  DisplayType,
  InnsendingType,
  MottaksadresseData,
  NavFormType,
  signatureUtils,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import React from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import useMottaksadresser from "../hooks/useMottaksadresser";
import useTemaKoder from "../hooks/useTemaKoder";
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
  if (form.properties.tema === "") {
    errors.tema = "Du må velge et tema";
  }
  return errors;
};

const isFormMetadataValid = (errors) => Object.keys(errors).length === 0;

export const COMPONENT_TEXTS = {
  BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR: "Bruker må velge enhet ved innsending på papir",
};

const BasicFormMetadataEditor = ({ form, onChange, usageContext, errors }: BasicFormProps) => {
  const { featureToggles } = useAppConfig();
  const { mottaksadresser, ready: isMottaksAdresserReady, errorMessage: mottaksadresseError } = useMottaksadresser();
  const { temaKoder, ready: isTemaKoderReady, errorMessage: temaKoderError } = useTemaKoder();
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
    <Fieldset hideLegend legend="">
      <Checkbox
        className="mb-double"
        id="teststatus"
        checked={!!isTestForm}
        onChange={(event) =>
          onChange({ ...form, properties: { ...form.properties, isTestForm: event.target.checked } })
        }
      >
        Dette er et testskjema
      </Checkbox>
      <TextField
        className="mb-double"
        label="Skjemanummer"
        type="text"
        id="skjemanummer"
        placeholder="Skriv inn skjemanummer"
        value={skjemanummer}
        readOnly={usageContext === "edit"}
        onChange={(event) =>
          onChange({ ...form, properties: { ...form.properties, skjemanummer: event.target.value } })
        }
        error={errors?.skjemanummer}
      />
      <TextField
        className="mb-double"
        label="Tittel"
        type="text"
        id="title"
        placeholder="Skriv inn tittel"
        value={title}
        onChange={(event) => onChange({ ...form, title: event.target.value })}
        error={errors?.title}
      />
      <div className="mb-double">
        <Select
          className="mb-small"
          label={"Tema"}
          id="tema"
          disabled={!isTemaKoderReady}
          value={Object.keys(temaKoder).includes(tema) ? tema : ""}
          onChange={(event) => onChange({ ...form, properties: { ...form.properties, tema: event.target.value } })}
          error={errors?.tema}
        >
          <option value="">{"Velg tema"}</option>
          {Object.entries(temaKoder)
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([key, value]) => (
              <option key={key} value={key}>
                {`${value} (${key})`}
              </option>
            ))}
        </Select>
        {temaKoderError && (
          <Alert variant="error" size="small">
            {temaKoderError}
          </Alert>
        )}
      </div>
      <TextField
        className="mb-double"
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
        className="mb-double"
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
          <TextField
            className="mb-double"
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
            className="mb-double"
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
        <div className="mb-default">
          <Select
            className="mb-small"
            label="Mottaksadresse"
            name="form-mottaksadresse"
            id="form-mottaksadresse"
            value={mottaksadresseId}
            disabled={!isMottaksAdresserReady}
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
              {mottaksadresseId && !isMottaksAdresserReady ? `Mottaksadresse-id: ${mottaksadresseId}` : "Standard"}
            </option>
            {mottaksadresser.map((adresse) => (
              <option value={adresse._id} key={adresse._id}>
                {toAddressString(adresse.data)}
              </option>
            ))}
          </Select>
          {mottaksadresseError && (
            <Alert variant="error" size="small">
              {mottaksadresseError}
            </Alert>
          )}
        </div>
      )}
      <div className="mb-double">
        <Link to="/mottaksadresser">Rediger mottaksadresser</Link>
      </div>
      {(innsending === "KUN_PAPIR" || innsending === "PAPIR_OG_DIGITAL") &&
        !mottaksadresseId &&
        featureToggles?.enableEnhetsListe && (
          <div className="mb-double">
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
          </div>
        )}

      <Textarea
        className="mb-double"
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

      <Button variant="secondary" className="mb-double" onClick={addNewSignature}>
        Legg til signatur
      </Button>
    </Fieldset>
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
      size="small"
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
