import { FormSummary } from '@navikt/ds-react';
import { submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultLabel from '../../shared/SummaryDefaultLabel';
import { FormComponentProps } from '../../types';

const SummaryNavSelect = (props: FormComponentProps) => {
  const { submission, submissionPath, component, translate } = props;
  const value = submissionUtils.getSubmissionValue(submissionPath, submission);

  const selectedValue =
    typeof value === 'string'
      ? value
      : typeof value === 'object' && value && 'value' in value
        ? value.value
        : undefined;
  const savedLabel =
    typeof value === 'object' && value && 'label' in value && typeof value.label === 'string' ? value.label : undefined;
  const selectedLabel = component.data?.values?.find((option) => option.value === selectedValue)?.label;

  if (!selectedValue) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{translate(savedLabel ?? selectedLabel ?? selectedValue)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryNavSelect;
