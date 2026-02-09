import { TextField } from '@navikt/ds-react';
import { Form, FormPropertiesType, FormSettingsDiff, SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
import React, { useCallback } from 'react';
import LabelWithDiff from '../LabelWithDiff';
import { FormMetadataError, UpdateFormFunction } from '../utils/utils';
import { SubmissionTypeCheckbox } from './SubmissionTypeCheckbox';

interface Props {
  onChange: UpdateFormFunction;
  diff: FormSettingsDiff;
  form: Form;
  errors?: FormMetadataError;
}

const mergeProperties = (
  form: Form,
  props: Pick<FormPropertiesType, 'uxSignalsId' | 'uxSignalsSubmissionTypes'>,
): Form => {
  return {
    ...form,
    properties: {
      ...form.properties,
      ...props,
    },
  };
};

const UxSignalsFields = ({ onChange, diff, form, errors }: Props) => {
  const { uxSignalsId, uxSignalsSubmissionTypes, submissionTypes } = form.properties;
  const isLockedForm = !!form.lock;

  const idChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, form: Form) => {
      const id = event.target.value?.trim();
      onChange(
        mergeProperties(form, {
          uxSignalsId: id || undefined,
          uxSignalsSubmissionTypes: id ? uxSignalsSubmissionTypes || submissionTypes : undefined,
        }),
      );
    },
    [onChange, uxSignalsSubmissionTypes, submissionTypes],
  );

  const submissionTypesChangeHandler = useCallback(
    (values: SubmissionType[], form: Form) => {
      onChange(
        mergeProperties(form, {
          uxSignalsSubmissionTypes: values,
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
      {uxSignalsId && submissionTypes.length > 1 && (
        <SubmissionTypeCheckbox
          name="uxSignalsSubmissionTypes"
          label={<LabelWithDiff label="UX signals skal vises for:" diff={!!diff.uxSignalsSubmissionTypes} />}
          value={uxSignalsSubmissionTypes || ['PAPER', 'DIGITAL']}
          onChange={(values) => submissionTypesChangeHandler(values, form)}
          hideTypes={['DIGITAL_NO_LOGIN', 'STATIC_PDF']}
          readonly={isLockedForm}
        />
      )}
    </>
  );
};

export default UxSignalsFields;
