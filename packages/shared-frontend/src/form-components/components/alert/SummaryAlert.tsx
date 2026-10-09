import { AlertDefinition } from '../../component-types';
import DefaultHtmlAnswer from '../../shared/SummaryDefaultHtmlAnswer';
import { FormComponentProps } from '../../types';

const SummaryAlert = (props: FormComponentProps<AlertDefinition>) => {
  return <DefaultHtmlAnswer {...props} />;
};

export default SummaryAlert;
