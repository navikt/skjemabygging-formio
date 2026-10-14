import { TextAreaDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryTextArea = (props: FormComponentProps<TextAreaDefinition>) => {
  return <DefaultAnswer {...props} />;
};

export default SummaryTextArea;
