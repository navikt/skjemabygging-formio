import { Alert, Button, Checkbox, Fieldset, Select, Textarea, TextField } from "@navikt/ds-react";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import {
  formDiffingTool,
  InnsendingType,
  MottaksadresseData,
  NavFormType,
  signatureUtils,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import useMottaksadresser from "../../hooks/useMottaksadresser";
import useTemaKoder from "../../hooks/useTemaKoder";
import SignatureComponent from "../layout/SignatureComponent";
import EnhetSettings from "./EnhetSettings";
import LabelWithDiff from "./LabelWithDiff";
import SubmissionTypeSelect from "./SubmissionTypeSelect";
import { FormMetadataError, UpdateFormFunction } from "./utils";

type UsageContext = "create" | "edit";

interface Props {
  form: NavFormType;
  publishedForm?: NavFormType;
  onChange: UpdateFormFunction;
  errors?: FormMetadataError;
}

type BasicFormProps = Props & { usageContext: UsageContext };

const BasicFormMetadataEditor = ({ form, publishedForm, onChange, usageContext, errors }: BasicFormProps) => {
  const { featureToggles } = useAppConfig();
  const { mottaksadresser, ready: isMottaksAdresserReady, errorMessage: mottaksadresseError } = useMottaksadresser();
  const { temaKoder, ready: isTemaKoderReady, errorMessage: temaKoderError } = useTemaKoder();
  const diff = formDiffingTool.generateNavFormSettingsDiff(publishedForm, form);
  const {
    title,
    properties: {
      isTestForm,
      skjemanummer,
      tema,
      downloadPdfButtonText,
      innsending: innsendingFraProps,
      ettersending,
      ettersendelsesfrist,
      mottaksadresseId,
      enhetMaVelgesVedPapirInnsending,
      enhetstyper,
      descriptionOfSignatures,
      descriptionOfSignaturesPositionUnder,
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
      {diff.errorMessage && <Alert variant="warning">{diff.errorMessage}</Alert>}
      <Checkbox
        className="mb"
        id="teststatus"
        checked={!!isTestForm}
        onChange={(event) =>
          onChange({ ...form, properties: { ...form.properties, isTestForm: event.target.checked } })
        }
      >
        Dette er et testskjema
      </Checkbox>
      <TextField
        className="mb"
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
        className="mb"
        label={<LabelWithDiff label="Tittel" diff={!!diff.title} />}
        type="text"
        id="title"
        placeholder="Skriv inn tittel"
        value={title}
        onChange={(event) => onChange({ ...form, title: event.target.value })}
        error={errors?.title}
      />
      <div className="mb">
        <Select
          className="mb-4"
          label={<LabelWithDiff label="Tema" diff={!!diff.tema} />}
          id="tema"
          disabled={!isTemaKoderReady}
          value={temaKoder?.find((temaKode) => temaKode.key === tema)?.key || ""}
          onChange={(event) => onChange({ ...form, properties: { ...form.properties, tema: event.target.value } })}
          error={errors?.tema}
        >
          <option value="">{"Velg tema"}</option>
          {temaKoder?.map(({ key, value }) => (
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
        className="mb"
        label={<LabelWithDiff label="Tekst på knapp for nedlasting av pdf" diff={!!diff.downloadPdfButtonText} />}
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

      <SubmissionTypeSelect
        name="form-innsending"
        label={<LabelWithDiff label="Innsending" diff={!!diff.innsending} />}
        value={innsending}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, innsending: event.target.value as InnsendingType },
          })
        }
      />
      <SubmissionTypeSelect
        name="form-ettersending"
        label={<LabelWithDiff label="Ettersending" diff={!!diff.ettersending} />}
        value={ettersending}
        allowEmpty={true}
        error={errors?.ettersending}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, ettersending: event.target.value as InnsendingType },
          })
        }
      />
      {!!ettersending && ettersending !== "INGEN" && (
        <TextField
          className="mb"
          label={<LabelWithDiff label="Ettersendelsesfrist (dager)" diff={!!diff.ettersendelsesfrist} />}
          type="number"
          id="ettersendelsesfrist"
          value={ettersendelsesfrist || ""}
          onChange={(event) =>
            onChange({
              ...form,
              properties: { ...form.properties, ettersendelsesfrist: event.target.value },
            })
          }
          placeholder={"Standard (14 dager)"}
        />
      )}

      {innsending === "INGEN" && (
        <>
          <TextField
            className="mb"
            label={<LabelWithDiff label="Overskrift til innsending" diff={!!diff.innsendingOverskrift} />}
            value={form.properties.innsendingOverskrift || ""}
            onChange={(event) =>
              onChange({
                ...form,
                properties: { ...form.properties, innsendingOverskrift: event.target.value },
              })
            }
          />
          <Textarea
            className="mb"
            label={<LabelWithDiff label="Forklaring til innsending" diff={!!diff.innsendingForklaring} />}
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
        <div>
          <Select
            className="mb-4"
            label={<LabelWithDiff label="Mottaksadresse" diff={!!diff.mottaksadresseId} />}
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
      <div className="mb">
        <Link to="/mottaksadresser">Rediger mottaksadresser</Link>
      </div>
      {(innsending === "KUN_PAPIR" || innsending === "PAPIR_OG_DIGITAL") &&
        !mottaksadresseId &&
        featureToggles?.enableEnhetsListe && (
          <div className="mb">
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
        label={<LabelWithDiff label="Generelle instruksjoner (valgfritt)" diff={!!diff.descriptionOfSignatures} />}
        value={descriptionOfSignatures || ""}
        maxLength={0}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, descriptionOfSignatures: event.target.value },
          })
        }
      />

      <Checkbox
        className="mb"
        checked={!!descriptionOfSignaturesPositionUnder}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, descriptionOfSignaturesPositionUnder: event.target.checked },
          })
        }
      >
        Plasser under signaturer
      </Checkbox>

      {signatureUtils.mapBackwardCompatibleSignatures(signatures)?.map((signature, index) => (
        <div key={signature.key}>
          <SignatureComponent
            signature={signature}
            diff={diff.signatures?.[signature.key]}
            index={index}
            onChange={(newSignature) => addExistingSignature(newSignature, index)}
            onDelete={() => removeSignature(signature.key)}
          />
        </div>
      ))}

      <Button variant="secondary" className="mb" onClick={addNewSignature}>
        Legg til signatur
      </Button>
    </Fieldset>
  );
};

export const CreationFormMetadataEditor = ({ form, onChange, errors }: Props) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext="create" errors={errors} />
);

export const FormMetadataEditor = ({ form, publishedForm, onChange, errors }: Props) => (
  <BasicFormMetadataEditor
    form={form}
    publishedForm={publishedForm}
    onChange={onChange}
    usageContext="edit"
    errors={errors}
  />
);
