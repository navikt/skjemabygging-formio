import { FormSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryCheckbox = (props: FormComponentProps) => {
  const { submissionPath, submission, translate } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  // Do not show anything if the checkbox is not checked
  if (!value) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{value ? translate(TEXTS.common.yes) : translate(TEXTS.common.no)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryCheckbox;
