import {
  Component,
  currencyUtils,
  submissionUtils as formComponentUtils,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';

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
