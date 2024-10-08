import { TextField } from '@navikt/ds-react';
import {
  FormPropertiesType,
  InnsendingType,
  NavFormSettingsDiff,
  NavFormType,
} from '@navikt/skjemadigitalisering-shared-domain';
import React, { useCallback } from 'react';
import LabelWithDiff from '../LabelWithDiff';
import SubmissionTypeSelect from '../SubmissionTypeSelect';
import { FormMetadataError, UpdateFormFunction } from '../utils/utils';

interface Props {
  onChange: UpdateFormFunction;
  diff: NavFormSettingsDiff;
  form: NavFormType;
  errors?: FormMetadataError;
}

const mergeProps = (form: NavFormType, props: Partial<FormPropertiesType>): NavFormType => ({
  ...form,
  properties: {
    ...form.properties,
    ...props,
  },
});

const UxSignalsFields = ({ onChange, diff, form, errors }: Props) => {
  const { uxSignalsId, uxSignalsInnsending, isLockedForm } = form.properties;

  const idChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, form: NavFormType) => {
      const id = event.target.value?.trim();
      onChange(
        mergeProps(form, {
          uxSignalsId: id || undefined,
          uxSignalsInnsending: id ? form.properties.uxSignalsInnsending || 'PAPIR_OG_DIGITAL' : undefined,
        }),
      );
    },
    [onChange],
  );

  const innsendingChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, form: NavFormType) => {
      const innsending: InnsendingType = event.target.value as InnsendingType;
      onChange(
        mergeProps(form, {
          uxSignalsInnsending: innsending || undefined,
        }),
      );
    },
    [onChange],
  );

  return (
    <>
      <TextField
        className="mb"
        id="uxSignalsId"
        label={<LabelWithDiff label="UX signals id" diff={!!diff.uxSignalsId} />}
        value={uxSignalsId || ''}
        onChange={(event) => idChangeHandler(event, form)}
        error={errors?.uxSignalsId}
        readOnly={isLockedForm}
      />
      {uxSignalsId && (
        <SubmissionTypeSelect
          name="uxSignalsInnsending"
          label={<LabelWithDiff label="UX signals skal vises for:" diff={!!diff.uxSignalsInnsending} />}
          showDefaultOption={false}
          value={uxSignalsInnsending || ''}
          onChange={(event) => innsendingChangeHandler(event, form)}
          excluded={['INGEN']}
          error={errors?.uxSignalsInnsending}
          readonly={isLockedForm}
        />
      )}
    </>
  );
};

export default UxSignalsFields;
