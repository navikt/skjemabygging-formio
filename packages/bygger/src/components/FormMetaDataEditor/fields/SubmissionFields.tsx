import { TextField, Textarea } from '@navikt/ds-react';
import { InnsendingType, NavFormSettingsDiff, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import LabelWithDiff from '../LabelWithDiff';
import SubmissionTypeSelect from '../SubmissionTypeSelect';
import { FormMetadataError, UpdateFormFunction } from '../utils';

export interface SubmissionFieldsProps {
  onChange: UpdateFormFunction;
  diff: NavFormSettingsDiff;
  form: NavFormType;
  errors?: FormMetadataError;
}

const SubmissionFields = ({ onChange, diff, form, errors }: SubmissionFieldsProps) => {
  const innsending = form.properties.innsending || 'PAPIR_OG_DIGITAL';
  const ettersending = form.properties.ettersending || 'PAPIR_OG_DIGITAL';
  const ettersendelsesfrist = form.properties.ettersendelsesfrist;

  return (
    <>
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

      {!!ettersending && ettersending !== 'INGEN' && (
        <TextField
          className="mb"
          label={<LabelWithDiff label="Ettersendelsesfrist (dager)" diff={!!diff.ettersendelsesfrist} />}
          type="number"
          id="ettersendelsesfrist"
          value={ettersendelsesfrist || ''}
          onChange={(event) =>
            onChange({
              ...form,
              properties: { ...form.properties, ettersendelsesfrist: event.target.value },
            })
          }
          placeholder={'Standard (14 dager)'}
        />
      )}

      {innsending === 'INGEN' && (
        <>
          <TextField
            className="mb"
            label={<LabelWithDiff label="Overskrift til innsending" diff={!!diff.innsendingOverskrift} />}
            value={form.properties.innsendingOverskrift || ''}
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
            onChange={(event) =>
              onChange({
                ...form,
                properties: { ...form.properties, innsendingForklaring: event.target.value },
              })
            }
          />
        </>
      )}
    </>
  );
};

export default SubmissionFields;
