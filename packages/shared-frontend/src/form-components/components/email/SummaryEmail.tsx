import { EmailDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryEmail = (props: FormComponentProps<EmailDefinition>) => {
  return <DefaultAnswer {...props} />;
};

export default SummaryEmail;
