import DefaultHtmlAnswer from '../../shared/form-summary/DefaultHtmlAnswer';
import { FormComponentProps } from '../../types';

const SummaryHtmlElement = (props: FormComponentProps) => {
  return <DefaultHtmlAnswer {...props} />;
};

export default SummaryHtmlElement;
