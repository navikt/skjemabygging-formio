import { FirstNameDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryFirstName = (props: FormComponentProps<FirstNameDefinition>) => {
  return <DefaultAnswer {...props} />;
};

export default SummaryFirstName;
