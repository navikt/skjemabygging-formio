import { TextFieldDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryTextField = (props: FormComponentProps<TextFieldDefinition>) => {
  return <DefaultAnswer {...props} />;
};

export default SummaryTextField;
