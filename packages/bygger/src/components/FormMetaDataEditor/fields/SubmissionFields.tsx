import { Checkbox, Textarea, TextField } from '@navikt/ds-react';
import {
  Form,
  FormSettingsDiff,
  InnsendingType,
  submissionTypesUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import LabelWithDiff from '../LabelWithDiff';
import SubmissionTypeSelect from '../SubmissionTypeSelect';
import { FormMetadataError, UpdateFormFunction } from '../utils/utils';
import { SubmissionTypeCheckbox } from './SubmissionTypeCheckbox';

export interface SubmissionFieldsProps {
  onChange: UpdateFormFunction;
  diff: FormSettingsDiff;
  form: Form;
  errors?: FormMetadataError;
}

const SubmissionFields = ({ onChange, diff, form, errors }: SubmissionFieldsProps) => {
  const { submissionTypes, ettersending, ettersendelsesfrist, hideUserTypes } = form.properties;
  const isLockedForm = !!form.lock;

  return (
    <>
      <SubmissionTypeCheckbox
        name="form-innsending"
        label={<LabelWithDiff label="Innsending" diff={!!diff.submissionTypes} />}
        value={submissionTypes}
        error={errors?.submissionTypes}
        readonly={isLockedForm}
        onChange={(data) =>
          onChange({
            ...form,
            properties: {
              ...form.properties,
              submissionTypes: [...data],
            },
          })
        }
      />

      <SubmissionTypeSelect
        name="form-ettersending"
        label={<LabelWithDiff label="Ettersending" diff={!!diff.ettersending} />}
        value={ettersending}
        error={errors?.ettersending}
        readonly={isLockedForm}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, ettersending: event.target.value as InnsendingType },
          })
        }
      />

      {!!ettersending && ettersending !== 'INGEN' && (
        <TextField
          onWheel={(e) => e.currentTarget.blur()} // disable scroll wheel on number input
          className="mb"
          label={<LabelWithDiff label="Ettersendelsesfrist (dager)" diff={!!diff.ettersendelsesfrist} />}
          type="number"
          id="ettersendelsesfrist"
          value={ettersendelsesfrist || ''}
          readOnly={isLockedForm}
          onChange={(event) =>
            onChange({
              ...form,
              properties: { ...form.properties, ettersendelsesfrist: event.target.value },
            })
          }
          placeholder={'Standard (14 dager)'}
        />
      )}

      {!submissionTypesUtils.isNoneSubmission(submissionTypes) && (
        <>
          <TextField
            className="mb"
            label={<LabelWithDiff label="Overskrift til innsending" diff={!!diff.innsendingOverskrift} />}
            value={form.properties.innsendingOverskrift || ''}
            readOnly={isLockedForm}
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
            value={form.properties.innsendingForklaring || ''}
            readOnly={isLockedForm}
            onChange={(event) =>
              onChange({
                ...form,
                properties: { ...form.properties, innsendingForklaring: event.target.value },
              })
            }
          />
        </>
      )}

      <Checkbox
        className="mb"
        checked={hideUserTypes}
        readOnly={isLockedForm}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, hideUserTypes: event.target.checked },
          })
        }
      >
        {'Skjul valg for hvem innsendingen gjelder i ettersendingsløsningen'}
      </Checkbox>
    </>
  );
};

export default SubmissionFields;
