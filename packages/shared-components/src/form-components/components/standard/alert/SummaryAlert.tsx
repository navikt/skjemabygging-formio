import { FormComponentProps } from '../../../types';
import DefaultHtmlAnswer from '../../shared/form-summary/DefaultHtmlAnswer';

const SummaryAlert = ({ component }: FormComponentProps) => {
  return <DefaultHtmlAnswer component={component} />;
};

export default SummaryAlert;
