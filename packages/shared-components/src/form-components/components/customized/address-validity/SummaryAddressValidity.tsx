import { FormSummary } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryAddressValidity = ({ submissionPath }: FormComponentProps) => {
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);
  const { translate } = useLanguages();

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
