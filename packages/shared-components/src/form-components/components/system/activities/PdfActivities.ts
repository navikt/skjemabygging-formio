import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfActivities = (props: PdfComponentProps) => {
  const getActivityValue = (value: any) => {
    return value?.text;
  };
  return DefaultAnswer(props, getActivityValue);
};

export default PdfActivities;
