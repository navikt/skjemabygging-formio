import { FormComponentProps } from '../../../types';
import DefaultHtmlAnswer from '../../shared/form-summary/DefaultHtmlAnswer';

const SummaryHtmlElement = (props: FormComponentProps) => {
  return <DefaultHtmlAnswer {...props} />;
};

export default SummaryHtmlElement;
