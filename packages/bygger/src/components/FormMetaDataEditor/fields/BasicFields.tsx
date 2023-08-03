import { TextField } from "@navikt/ds-react";
import { NavFormSettingsDiff, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import LabelWithDiff from "../LabelWithDiff";
import { FormMetadataError, UpdateFormFunction } from "../utils";
import TemaKodeFields from "./TemaKodeFields";
import TestSkjemaFields from "./TestSkjemaFields";

export interface BasicFieldsProps {
  onChange: UpdateFormFunction;
  diff: NavFormSettingsDiff;
  form: NavFormType;
  errors?: FormMetadataError;
  usageContext: "create" | "edit";
}

const BasicFields = ({ onChange, diff, form, errors, usageContext }: BasicFieldsProps) => {
  const skjemanummer = form.properties.skjemanummer;
  const title = form.title;

  const testSkjemaFields = () => <TestSkjemaFields onChange={onChange} form={form} />;

  const temaKodeFields = () => (
    <TemaKodeFields onChange={onChange} diff={diff} form={form} errors={errors}></TemaKodeFields>
  );

  return (
    <>
      {testSkjemaFields()}
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
      {temaKodeFields()}
    </>
  );
};

export default BasicFields;
