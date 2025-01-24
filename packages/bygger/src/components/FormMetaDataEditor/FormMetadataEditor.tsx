import { Alert, Fieldset, Textarea, TextField } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { formDiffingTool, NavFormType, TEXTS, UsageContext } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../context/old_form/FormContext';
import AddressFields from './fields/AddressFields';
import BasicFields from './fields/BasicFields';
import DeclarationFields from './fields/DeclarationFields';
import EnhetFields from './fields/EnhetFields';
import MellomlagrinDurationFields from './fields/MellomlagringDurationFields';
import SignatureFields from './fields/SignatureFields';
import SubmissionFields from './fields/SubmissionFields';
import UxSignalsFields from './fields/UxSignalsFields';
import LabelWithDiff from './LabelWithDiff';
import { FormMetadataError, UpdateFormFunction } from './utils/utils';

interface Props {
  form: NavFormType;
  onChange: UpdateFormFunction;
  errors?: FormMetadataError;
}

type BasicFormProps = Props & { usageContext: UsageContext };

const BasicFormMetadataEditor = ({ form, onChange, usageContext, errors }: BasicFormProps) => {
  const { diffOn } = useAppConfig();
  const { formState } = useForm();
  const diff =
    diffOn && formState.publishedForm ? formDiffingTool.generateNavFormSettingsDiff(formState.publishedForm, form) : {};
  const {
    properties: { downloadPdfButtonText, descriptionOfSignatures, isLockedForm },
  } = form;

  const basicFields = () => (
    <BasicFields onChange={onChange} diff={diff} form={form} errors={errors} usageContext={usageContext} />
  );

  const declarationFields = () => (
    <DeclarationFields onChange={onChange} diff={diff} form={form} errors={errors}></DeclarationFields>
  );

  const downloadPdfButtonTextFields = () => (
    <TextField
      className="mb"
      label={<LabelWithDiff label="Tekst på knapp for nedlasting av pdf" diff={!!diff.downloadPdfButtonText} />}
      type="text"
      id="downloadPdfButtonText"
      value={downloadPdfButtonText || ''}
      onChange={(event) =>
        onChange({
          ...form,
          properties: { ...form.properties, downloadPdfButtonText: event.target.value },
        })
      }
      placeholder={TEXTS.grensesnitt.downloadApplication}
      readOnly={isLockedForm}
    />
  );

  const submissionFields = () => (
    <SubmissionFields onChange={onChange} diff={diff} form={form} errors={errors}></SubmissionFields>
  );

  const addressFields = () => <AddressFields onChange={onChange} diff={diff} form={form}></AddressFields>;

  const enhetFields = () => <EnhetFields onChange={onChange} form={form}></EnhetFields>;

  const instructionFields = () => (
    <>
      <Textarea
        label={<LabelWithDiff label="Generelle instruksjoner (valgfritt)" diff={!!diff.descriptionOfSignatures} />}
        value={descriptionOfSignatures || ''}
        maxLength={0}
        readOnly={isLockedForm}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, descriptionOfSignatures: event.target.value },
          })
        }
      />
    </>
  );

  const signatureFields = () => <SignatureFields onChange={onChange} diff={diff} form={form} />;

  const mellomlagringFields = () => (
    <MellomlagrinDurationFields onChange={onChange} diff={diff} form={form} errors={errors} />
  );

  const uxSignalsFields = () => <UxSignalsFields onChange={onChange} diff={diff} form={form} />;

  return (
    <Fieldset hideLegend legend="">
      {diff.errorMessage && <Alert variant="warning">{diff.errorMessage}</Alert>}
      <div className="mb">{basicFields()}</div>
      {usageContext === 'edit' && (
        <>
          {declarationFields()}
          {downloadPdfButtonTextFields()}
          {submissionFields()}
          {addressFields()}
          {enhetFields()}
          {uxSignalsFields()}
          {mellomlagringFields()}
          {instructionFields()}
          {signatureFields()}
        </>
      )}
    </Fieldset>
  );
};

export const CreationFormMetadataEditor = ({ form, onChange, errors }: Props) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext="create" errors={errors} />
);

export const FormMetadataEditor = ({ form, onChange, errors }: Props) => (
  <BasicFormMetadataEditor form={form} onChange={onChange} usageContext="edit" errors={errors} />
);
