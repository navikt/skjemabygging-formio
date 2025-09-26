import { FormComponentProps } from '../../../types';
import DefaultHtmlAnswer from '../../shared/form-summary/DefaultHtmlAnswer';

const SummaryHtmlElement = ({ component }: FormComponentProps) => {
  return <DefaultHtmlAnswer component={component} />;
};

export default SummaryHtmlElement;
