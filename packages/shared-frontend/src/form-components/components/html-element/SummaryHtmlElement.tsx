import { HtmlElementDefinition } from '../../component-types';
import DefaultHtmlAnswer from '../../shared/SummaryDefaultHtmlAnswer';
import { FormComponentProps } from '../../types';

const SummaryHtmlElement = (props: FormComponentProps<HtmlElementDefinition>) => {
  return <DefaultHtmlAnswer {...props} />;
};

export default SummaryHtmlElement;
