import { FormSummary } from '@navikt/ds-react';
import {
  dateUtils,
  submissionUtils as formComponentUtils,
  stringUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import DefaultLabel from '../../shared/SummaryDefaultLabel';
import { FormComponentProps } from '../../types';

const SummaryMonthPicker = (props: FormComponentProps) => {
  const { submission, submissionPath, currentLanguage } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>
        {stringUtils.toPascalCase(dateUtils.toLongMonthFormat(value, currentLanguage))}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryMonthPicker;
