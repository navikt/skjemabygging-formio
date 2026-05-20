import { FormSummary } from '@navikt/ds-react';
import { currencyUtils, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultLabel from '../../shared/SummaryDefaultLabel';
import { FormComponentProps } from '../../types';

const SummaryCurrency = (props: FormComponentProps) => {
  const { submission, submissionPath, component } = props;
  const { currency, inputType } = component;

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  const currencyValue = currencyUtils.toLocaleString(value, {
    iso: true,
    currency,
    integer: inputType === 'numeric',
  });

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{currencyValue}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryCurrency;
