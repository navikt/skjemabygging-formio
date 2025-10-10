import { Component, currencyUtils, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import formComponentUtils from '../../../utils/formComponent';

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
