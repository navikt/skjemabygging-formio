import { FormSummary } from '@navikt/ds-react';
import { dateUtils, submissionUtils as formComponentUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../types';

const SummaryAddressValidity = (props: FormComponentProps) => {
  const { submission, submissionPath, translate } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || (!value.gyldigFraOgMed && !value.gyldigTilOgMed)) {
    return null;
  }

  return (
    <>
      {value.gyldigFraOgMed && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(TEXTS.statiske.address.validFrom)}</FormSummary.Label>
          <FormSummary.Value>{dateUtils.toLocaleDate(value.gyldigFraOgMed)}</FormSummary.Value>
        </FormSummary.Answer>
      )}
      {value.gyldigTilOgMed && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(TEXTS.statiske.address.validTo)}</FormSummary.Label>
          <FormSummary.Value>{dateUtils.toLocaleDate(value.gyldigTilOgMed)}</FormSummary.Value>
        </FormSummary.Answer>
      )}
    </>
  );
};

export default SummaryAddressValidity;
