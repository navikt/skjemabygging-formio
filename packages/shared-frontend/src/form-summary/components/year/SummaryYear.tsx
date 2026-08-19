import { toInputFormat } from '../../../formatting/inputFormat';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryYear = (props: FormComponentProps) => {
  return <DefaultAnswer {...props} valueFormat={(value) => toInputFormat(value, 'year')} />;
};

export default SummaryYear;
