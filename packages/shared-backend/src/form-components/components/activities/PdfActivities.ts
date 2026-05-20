import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfActivities = (props: PdfComponentProps): PdfData | null => {
  const getActivityValue = (value: any) => {
    return value?.text;
  };
  return DefaultAnswer(props, getActivityValue);
};

export default PdfActivities;
