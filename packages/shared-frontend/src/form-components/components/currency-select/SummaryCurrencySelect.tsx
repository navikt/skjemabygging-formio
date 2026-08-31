import { CurrencySelectDefinition } from '../../component-types';
import DefaultSelectAnswer from '../../shared/SummaryDefaultSelectAnswer';
import { FormComponentProps } from '../../types';

const SummaryCurrencySelect = (props: FormComponentProps<CurrencySelectDefinition>) => {
  return <DefaultSelectAnswer {...props} />;
};

export default SummaryCurrencySelect;
