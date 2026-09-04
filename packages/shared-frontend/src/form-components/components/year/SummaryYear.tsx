import { toInputFormat } from '../../../formatting/inputFormat';
import { YearDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryYear = (props: FormComponentProps<YearDefinition>) => {
  return <DefaultAnswer {...props} valueFormat={(value) => toInputFormat(value, 'year')} />;
};

export default SummaryYear;
