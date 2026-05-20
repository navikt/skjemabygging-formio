import { Component } from '../../../models/form/component';
import { Submission } from '../../../models/form/submission';
import { currencyUtils } from '../../../utils/currency/currencyUtils';
import { submissionUtils as formComponentUtils } from '../../../utils/submission/submissionUtils';

const getChildSubmissionValue = (
  type: string,
  submissionPath: string,
  components: Component[],
  submission: Submission,
) => {
  return formComponentUtils.getSubmissionValue(
    `${submissionPath}.${components.find((c) => c.type === type)?.key}`,
    submission,
  );
};

const getCurrencyValue = (submissionPath: string, components: Component[], submission: Submission) => {
  return currencyUtils.toLocaleString(getChildSubmissionValue('number', submissionPath, components, submission), {
    iso: true,
    currency: getChildSubmissionValue('valutavelger', submissionPath, components, submission)?.value,
    integer: false,
  });
};

export { getCurrencyValue };
