import { dateUtils, PdfData, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfAddressValidity = (props: PdfComponentProps): PdfData[] | null => {
  const { submissionPath, submission, translate } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || (!value.gyldigFraOgMed && !value.gyldigTilOgMed)) {
    return null;
  }

  const result: PdfData[] = [];

  if (value.gyldigFraOgMed) {
    result.push({
      label: translate(TEXTS.statiske.address.validFrom),
      verdi: dateUtils.toLocaleDate(value.gyldigFraOgMed),
    });
  }

  if (value.gyldigTilOgMed) {
    result.push({
      label: translate(TEXTS.statiske.address.validTo),
      verdi: dateUtils.toLocaleDate(value.gyldigTilOgMed),
    });
  }

  return result;
};

export default PdfAddressValidity;
