import { SurnameDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryTextField = (props: FormComponentProps<SurnameDefinition>) => {
  return <DefaultAnswer {...props} />;
};

export default SummaryTextField;
