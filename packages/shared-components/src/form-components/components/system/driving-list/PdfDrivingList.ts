import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import { getDrivingListItems } from './drivingListUtils';

const PdfDrivingList = ({ component, submissionPath, languagesContextValue, formContextValue }: PdfComponentProps) => {
  const { label } = component;
  const { translate } = languagesContextValue;
  const { submission } = formContextValue;

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value?.dates || value?.dates.length === 0) {
    return null;
  }

  const drivingListDates = getDrivingListItems(value.dates, languagesContextValue);

  return {
    label: translate(label),
    verdi: value.description,
    verdiliste: drivingListDates.map((drivingListDate) => {
      return {
        label: drivingListDate,
      };
    }),
    visningsVariant: 'PUNKTLISTE',
  };
};

export default PdfDrivingList;
