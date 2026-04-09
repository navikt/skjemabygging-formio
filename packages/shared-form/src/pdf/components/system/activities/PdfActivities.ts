import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfActivities = (props: PdfComponentProps): PdfData | null => {
  const getActivityValue = (value: any) => {
    return value?.text;
  };
  return DefaultAnswer(props, getActivityValue);
};

export default PdfActivities;
