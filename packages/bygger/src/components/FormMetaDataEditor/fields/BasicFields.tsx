import { TextField } from '@navikt/ds-react';
import { Form, FormSettingsDiff, UsageContext } from '@navikt/skjemadigitalisering-shared-domain';
import LabelWithDiff from '../LabelWithDiff';
import { FormMetadataError, UpdateFormFunction } from '../utils/utils';
import TemaKodeFields from './TemaKodeFields';
import TestSkjemaFields from './TestSkjemaFields';

export interface BasicFieldsProps {
  onChange: UpdateFormFunction;
  diff: FormSettingsDiff;
  form: Form;
  errors?: FormMetadataError;
  usageContext: UsageContext;
}

const BasicFields = ({ onChange, diff, form, errors, usageContext }: BasicFieldsProps) => {
  const skjemanummer = form.skjemanummer;
  const isLockedForm = !!form.lock;

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
        readOnly={usageContext === 'edit'}
        onChange={(event) =>
          onChange({ ...form, skjemanummer: event.target.value, properties: { ...form.properties } })
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
        readOnly={isLockedForm}
      />
      {temaKodeFields()}
    </>
  );
};

export default BasicFields;
