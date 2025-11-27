import { FormSummary } from '@navikt/ds-react';
import { currencyUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

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
