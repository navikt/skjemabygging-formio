import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfAddressValidity = ({ submissionPath, languagesContext, formContext }: PdfComponentProps) => {
  const { translate } = languagesContext;
  const { submission } = formContext;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || (!value.gyldigFraOgMed && !value.gyldigTilOgMed)) {
    return null;
  }

  return [
    {
      label: translate(TEXTS.statiske.address.validFrom),
      verdi: dateUtils.toLocaleDate(value.gyldigFraOgMed),
    },
    {
      label: translate(TEXTS.statiske.address.validTo),
      verdi: dateUtils.toLocaleDate(value.gyldigTilOgMed),
    },
  ];
};

export default PdfAddressValidity;
