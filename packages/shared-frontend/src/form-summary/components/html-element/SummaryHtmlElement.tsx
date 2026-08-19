import DefaultHtmlAnswer from '../../shared/SummaryDefaultHtmlAnswer';
import { FormComponentProps } from '../../types';

const SummaryHtmlElement = (props: FormComponentProps) => {
  return <DefaultHtmlAnswer {...props} />;
};

export default SummaryHtmlElement;
