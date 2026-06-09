import {
  PdfData,
  TEXTS,
  submissionUtils as formComponentUtils,
  getDrivingListItems,
} from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';

const PdfDrivingList = (props: PdfComponentProps): PdfData | null => {
  const { component, submissionPath, submission, translate, currentLanguage } = props;
  const { label } = component;

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value?.dates || value?.dates.length === 0) {
    return null;
  }

  const drivingListDates = getDrivingListItems(value.dates, currentLanguage, translate);

  return {
    label: translate(label),
    verdi: translate(TEXTS.statiske.drivingList.summaryDescription),
    verdiliste: drivingListDates.map((drivingListDate) => {
      return {
        label: drivingListDate,
      };
    }),
    visningsVariant: 'PUNKTLISTE',
  };
};

export default PdfDrivingList;
