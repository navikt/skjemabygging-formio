import { RadioPanelDefinition } from '../../component-types';
import { DefaultListAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryRadio = (props: FormComponentProps<RadioPanelDefinition>) => {
  return <DefaultListAnswer {...props} />;
};

export default SummaryRadio;
